"""ADR0095 OPDA binding over the established BA/SA source, queue and media owners.

Only this finite private run is mutable. No sharing, cloud delivery or publishing.
"""
import argparse
import asyncio
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
AI = ROOT.parent / 'hm/semantic-ai-stratecy-business-architecture/scripts/notebooks'
sys.path.insert(0, str(AI))
import prepare as source_owner
import pipeline as media_owner

adapter = source_owner.adapter
worker, native = adapter.worker, adapter.native
quota = adapter.generation_quota()
# Saturate the finite commission; the inherited four-per-medium cap is a local
# policy, not a provider limit. Provider-reported quotas and uncertainty still apply.
quota.MAX_ACTIVE = None
owner = adapter.load_module('generation-ownership')
WORK = ROOT / '.local/property-pack-media/runs/property-pack-v1'
DIRECTORY = WORK / 'docs/generation'
CATALOGUE = 'docs/notebooklm/property-pack-media/catalogue.json'
HASH = lambda value: hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()
read = lambda file: json.loads(file.read_text())
save = quota.atomic_json


def stable_file_readback(body):
    # Native full-text responses rotate signed image URLs while retaining the
    # same indexed text and image dimensions. Do not change any other content.
    return re.sub(r'https://lh3\.googleusercontent\.com/notebooklm/[A-Za-z0-9_-]+(?==|\s|$)',
                  'https://lh3.googleusercontent.com/notebooklm/ROTATING', body)


def resolve():
    return json.loads(subprocess.check_output(['node', 'scripts/notebooks/property-pack-inputs.mjs', CATALOGUE], cwd=ROOT))


def client():
    from notebooklm_tools.utils.config import get_config
    assert not os.environ.get('NOTEBOOKLM_COOKIES'), 'Use the approved saved profile'
    assert get_config().auth.default_profile == 'personal', 'Approved NotebookLM profile personal is not the saved default'
    return worker.get_client()


def consumed(request, notebook, ids):
    constants = native.constants
    values = dict(notebook_id=notebook, source_ids=ids, language='en-GB', focus_prompt=request['prompt'])
    settings, kind = request['settings'], request['type']
    if kind == 'slide_deck':
        values.update(format_code=constants.SLIDE_DECK_FORMATS.get_code(request['format']), length_code=4)
    elif kind == 'audio':
        values.update(format_code=constants.AUDIO_FORMATS.get_code(request['format']), length_code=constants.AUDIO_LENGTHS.get_code('default'))
    elif kind == 'video':
        values.update(format_code=constants.VIDEO_FORMATS.get_code(request['format']), visual_style_code=None if request['format']=='cinematic' else constants.VIDEO_STYLES.get_code('auto_select'))
    else:
        values.update(orientation_code=constants.INFOGRAPHIC_ORIENTATIONS.get_code('landscape'), detail_level_code=constants.INFOGRAPHIC_DETAILS.get_code(settings['detail_level']), visual_style_code=constants.INFOGRAPHIC_STYLES.get_code('auto_select'))
    return values


def bind():
    adapter.ROOT = worker.ROOT = WORK
    adapter.WORK = worker.WORK = source_owner.WORK = owner.WORK = WORK
    owner.ROOT = WORK
    native.ROOT, native.DIRECTORY = ROOT, DIRECTORY
    adapter.FILES = worker.FILES = sorted(DIRECTORY.glob('*.json'))
    worker.create = adapter.create
    worker.node = checkpoint
    media_owner.WORK = WORK
    media_owner.owner = owner
    # Retain the existing original-video selection and complete-decode proof.
    worker.download_original = media_owner.download_original
    worker.recover_stalled = lambda api,runs,meter,cfg,now: media_owner.restart_stalled(api,runs,quota,meter,cfg,now)
    # The same owner serialises recovery and download; no competing transfer exists.
    owner.transfer_recovery_allowed = lambda: True
    native.retired_provider_ids = lambda notebook: set()


def import_original_file(api, receipt, source, finalize=True):
    """Native SDK upload, with the existing source owner retaining durable intent."""
    file = ROOT/source['path']
    assert HASH(file.read_bytes()) == source['sha256']
    row = receipt['sources'].setdefault(source['id'], {'title':source['title'],'sha256':source['sha256'],'status':'planned'})
    assert row['sha256'] == source['sha256']
    upload = WORK/'source-originals'/(source['id']+'-'+source['sha256'][:12]+file.suffix.lower())
    upload.parent.mkdir(parents=True, exist_ok=True)
    if not upload.exists(): shutil.copyfile(file,upload)
    assert HASH(upload.read_bytes()) == source['sha256']
    if not row.get('sourceId'):
        matches = [s for s in api.get_notebook_sources_with_types(receipt['notebookId']) if s['title'] in (upload.name,source['title'])]
        assert len(matches)<=1, 'Ambiguous original upload identity'
        if matches:
            row.update(sourceId=matches[0]['id'],status='submitted')
        else:
            assert row['status']=='planned', 'Uncertain original upload requires reconciliation'
            row.update(status='submitting',attemptedAt=native.NOW())
            source_owner.save_receipt(receipt)
            result=native.create_once(api,api.add_file,receipt['notebookId'],str(upload),fenced_rpc=api.RPC_ADD_SOURCE_FILE)
            assert result and result.get('id'), 'Unacknowledged original upload retained'
            row.update(sourceId=result['id'],status='submitted')
        source_owner.save_receipt(receipt)
    if not finalize:
        return row['sourceId'], None
    api.wait_for_source_ready(receipt['notebookId'],row['sourceId'],600)
    api.rename_source(receipt['notebookId'],row['sourceId'],source['title'])
    body=api.get_source_fulltext(row['sourceId'])
    assert body['title']==source['title'] and body['content'].strip(), 'Original indexing incomplete'
    row.update(status='indexed-verified',indexedTextSha256=HASH(body['content']),verifiedAt=native.NOW(),
        verification='native-original-file-upload-sha256-and-complete-indexed-text-readback',
        verificationLimits='Original file bytes supplied natively, including embedded visuals; complete indexed text retained. Readback does not prove visual/table extraction fidelity or byte equality to the binary original.')
    source_owner.save_receipt(receipt)
    return row['sourceId'],body


def prepare():
    proposed = resolve()
    bind()
    with owner.StageLock('source-import'):
        if (WORK/'request-inputs.json').exists():
            frozen=validate()
            print(json.dumps({'reused':True,'requests':len(frozen['requests']),'sources':len(frozen['sources']),'providerMutations':0}))
            return
        file = WORK / 'source-import.json'
        inherited, inherited_sources = {}, {}
        predecessors = proposed['config'].get('predecessorRuns') or ([proposed['config']['predecessorRun']] if proposed['config'].get('predecessorRun') else [])
        previous = predecessors[-1] if predecessors else None
        for predecessor in predecessors:
            previous = predecessor
            assert previous.replace('-','').isalnum(), 'Invalid predecessor run'
            base = WORK.parent/previous
            prior_snapshot=read(base/'request-inputs.json')
            for source in prior_snapshot['sources']:
                inherited_sources.setdefault(source['id'], (source, base))
            for request in prior_snapshot['requests']:
                if request['key'] in inherited:
                    assert inherited[request['key']]['completeInputSha256']==request['completeInputSha256'], 'Conflicting inherited request'
                inherited[request['key']]={**request,'inheritedFrom':request.get('inheritedFrom',{'run':previous,'chapter':request['chapter'],'manifestSha256':prior_snapshot['manifestSha256']})}
        if file.exists():
            receipt = read(file)
        elif previous:
            if (base/'source-import.json').exists():
                receipt = read(base/'source-import.json')
            else:
                prior_snapshot = read(base/'request-inputs.json')
                receipt = {'schema':'opda.notebook-source-import.v1','notebookId':prior_snapshot['notebookId'],
                    'sources':{s['id']:{'title':s['title'],'sha256':s['uploadedSha256'],'status':'indexed-verified','sourceId':s['sourceId'],'indexedTextSha256':s['indexedTextSha256'],'verification':s['verification']} for s in prior_snapshot['sources']}}
            receipt['manifestSha256'] = proposed['manifestSha256']
            receipt['sources'] = {k:v for k,v in receipt['sources'].items() if k in {s['id'] for s in proposed['sources']}}
        else:
            receipt = {'schema':'opda.notebook-source-import.v1', 'sources':{}}
        assert receipt.get('manifestSha256', proposed['manifestSha256']) == proposed['manifestSha256'], 'Frozen catalogue changed; create a successor run'
        receipt['manifestSha256'] = proposed['manifestSha256']
        save(file, receipt)
        api = client()
        if not receipt.get('notebookId'):
            title = proposed['config']['notebookTitle']
            found = [n for n in api.list_notebooks() if n.title == title]
            assert len(found) <= 1, 'Ambiguous notebook identity'
            if found:
                notebook = found[0]
            else:
                assert not receipt.get('notebookIntentAt'), 'Uncertain notebook create requires reconciliation'
                receipt['notebookIntentAt'] = native.NOW()
                save(file, receipt)
                notebook = native.create_once(api, api.create_notebook, title, fenced_rpc=api.RPC_CREATE_NOTEBOOK)
            receipt.update(notebookId=notebook.id, title=title, profile='personal')
            save(file, receipt)
        # Admit independent native files before waiting for indexing, preserving
        # one durable receipt writer and each acknowledged source identity.
        for source in proposed['sources']:
            if source.get('ingestKind')=='file':
                import_original_file(api, receipt, source, finalize=False)
        for source in proposed['sources']:
            if source.get('ingestKind')=='file':
                source_id,body=import_original_file(api,receipt,source)
                if source['id'] in inherited_sources:
                    prior, origin = inherited_sources[source['id']]
                    assert prior['sha256']==source['sha256'] and prior['sourceId']==source_id, 'Inherited original identity changed'
                    retained=read(origin/'source-readbacks'/(source_id+'.json'))
                    assert HASH(retained['content'])==prior['indexedTextSha256']
                    assert stable_file_readback(body['content'])==stable_file_readback(retained['content']), 'Inherited indexed content changed'
                    if HASH(body['content'])!=prior['indexedTextSha256']:
                        observation=HASH(body['content'])
                        save(WORK/'source-readback-observations'/(source_id+'-'+observation+'.json'),body)
                        receipt['sources'][source['id']].update(indexedTextSha256=prior['indexedTextSha256'], latestReadbackSha256=observation,
                            readbackComparison='Complete text identical except rotating provider image URL tokens; original bytes and image dimensions unchanged; first full readback retained')
                        source_owner.save_receipt(receipt)
                    body=retained
                source.update(sourceId=source_id,body=body['content'],bodySha256=HASH(body['content']),uploadedBody=body['content'],uploadedSha256=source['sha256'],indexedTextSha256=HASH(body['content']),verification=receipt['sources'][source['id']]['verification'],verificationLimits=receipt['sources'][source['id']]['verificationLimits'])
                if receipt['sources'][source['id']].get('readbackComparison'):
                    source.update(readbackComparison=receipt['sources'][source['id']]['readbackComparison'],latestReadbackSha256=receipt['sources'][source['id']]['latestReadbackSha256'])
                save(WORK/'source-readbacks'/(source_id+'.json'),body)
                continue
            literal = source['body'] if source['kind']=='original' else None
            uploaded = source_owner.literal_presentation(literal) if literal is not None else source['body']
            source_id = source_owner.import_text(api, receipt, source['id'], uploaded, source['title'], literal_body=literal)
            assert source_id, 'Uncertain source import retained for reconciliation'
            body = api.get_source_fulltext(source_id)
            assert HASH(body['content']) == receipt['sources'][source['id']]['indexedTextSha256']
            save(WORK/'source-readbacks'/(source_id+'.json'), body)
            source.update(sourceId=source_id, uploadedBody=uploaded, uploadedSha256=HASH(uploaded), indexedTextSha256=HASH(body['content']), verification=receipt['sources'][source['id']]['verification'])
        available = {s['id']:s['title'] for s in api.get_notebook_sources_with_types(receipt['notebookId'])}
        expected = {s['sourceId']:s['title'] for s in proposed['sources']}
        assert {key:available.get(key) for key in expected} == expected, 'Selected notebook source membership differs from the frozen package'
        proposed.update(notebookId=receipt['notebookId'], preparedAt=native.NOW(), sourceMembership=expected, unselectedSourceIds=sorted(set(available)-set(expected)))
        by_key = {s['id']:s for s in proposed['sources']}
        runs = {}
        for request in proposed['requests']:
            selected = [by_key[k] for k in request['topic']['sourceKeys']]
            ids = [s['sourceId'] for s in selected]
            request.update(sourceIds=ids, consumedCreateArguments=consumed(request, receipt['notebookId'], ids), selectedSources=[{k:v for k,v in s.items() if k not in ('body','uploadedBody')} for s in selected])
            request['completeInputSha256'] = HASH(json.dumps({'arguments':request['consumedCreateArguments'],'sourceHashes':{s['sourceId']:s['indexedTextSha256'] for s in selected}}, sort_keys=True))
            if request['key'] in inherited:
                prior = inherited[request['key']]
                assert prior['completeInputSha256'] == request['completeInputSha256'], 'Inherited request changed; use a new topic identity'
                request['inheritedFrom'] = prior.get('inheritedFrom', {'run':previous,'chapter':prior['chapter'],'manifestSha256':read(base/'request-inputs.json')['manifestSha256']})
            section = request['chapter']
            subject = {'id':section, 'title':request['chapterTitle'], 'factualSourceIds':ids, 'mediaPrompts':{}, 'promptHashes':{}}
            run = runs.setdefault(section, {'schemaVersion':1,'sectionId':section,'notebookId':receipt['notebookId'],'commissioned':True,'publish':False,'manifestSha256':proposed['manifestSha256'],'subjects':[subject],'jobs':[]})
            subject = run['subjects'][0]
            medium = request['key']
            subject['mediaPrompts'][medium] = request['prompt']
            subject['promptHashes'][medium] = request['promptSha256']
            if 'inheritedFrom' not in request:
                run['jobs'].append({**{k:request[k] for k in ('key','type','format','ordinal','settings','promptSha256','completeInputSha256','acceptance')}, 'subject':section,'medium':medium,'level':int(section[-2:])-1,'editorial':False,'version':1,'status':'planned','topicId':request['topic']['id'],'topicTitle':request['topic']['title'],'title':request['topic']['title']+' — '+request['key'].removeprefix(request['topic']['id']+'-')})
        for section, run in runs.items():
            run['requested'] = len(run['jobs'])
            run['inputSha256'] = HASH(json.dumps(run['subjects'], ensure_ascii=False, separators=(',',':')))
            target = DIRECTORY/(section+'.json')
            if target.exists():
                previous = read(target)
                assert all(previous[k]==run[k] for k in ('subjects','manifestSha256','inputSha256','requested'))
            else:
                save(target, run)
        target = WORK/'request-inputs.json'
        if target.exists():
            assert read(target)['sources'] == proposed['sources'], 'Frozen source bodies changed'
        else:
            save(target, proposed)
        save(WORK/'generation-control.json', {'schemaVersion':1,'desiredState':'hold','reconcileSeconds':30,'probeBackoffSeconds':60})
        print(json.dumps({'prepared':len(runs),'requests':len(proposed['requests']),'newRequests':sum(len(r['jobs']) for r in runs.values()),'sources':len(proposed['sources']),'notebookId':receipt['notebookId']}))


def validate():
    bind()
    frozen = read(WORK/'request-inputs.json')
    current = resolve()
    assert frozen['manifestSha256'] == current['manifestSha256']
    assert {s['id']:s['sha256'] for s in frozen['sources']} == {s['id']:s['sha256'] for s in current['sources']}
    requests = {r['key']:r for r in frozen['requests']}
    for source in frozen['sources']:
        body = read(WORK/'source-readbacks'/(source['sourceId']+'.json'))
        assert HASH(body['content']) == source['indexedTextSha256']
    for run in adapter.reads():
        assert not run['publish'] and run['notebookId'] == frozen['notebookId']
        for job in run['jobs']:
            adapter.brief(run, job)
            request = requests[job['key']]
            assert job['completeInputSha256']==request['completeInputSha256'] and job['settings']==request['settings']
    assert sum(len(r['jobs']) for r in adapter.reads()) == sum('inheritedFrom' not in r for r in requests.values())
    return frozen


def checkpoint(command, run, job, value=None):
    file = DIRECTORY/(run['sectionId']+'.json')
    current = read(file)
    target = next(j for j in current['jobs'] if j['key']==job['key'])
    if command == 'job-intent':
        assert target['status']=='planned' and not target.get('id')
        result = adapter.settings(current, target)
        target.update(status='submitting',attemptedAt=native.NOW(),sourceIds=result['source_ids'])
    elif command == 'job-ack':
        assert target['status'] in ('submitting','needs-reconciliation') and not target.get('id')
        assert not any(j.get('id')==value for r in adapter.reads() for j in r['jobs'])
        target.update(id=value,status='submitted',acknowledgedAt=native.NOW())
        result = {'id':value}
    elif command == 'job-uncertain':
        assert target['status']=='submitting'
        target.update(status='needs-reconciliation',errorType=value)
        result = {'status':target['status']}
    else:
        raise ValueError('Unknown checkpoint')
    native.save(file,current)
    return result


def refresh():
    index = ROOT/'scripts/notebooks/property-pack-index.mjs'
    if index.exists():
        subprocess.run(['node',str(index),'--run',WORK.name],cwd=ROOT,check=True)


def reconcile_video_readiness(api):
    """Upgrade legacy downloads through the existing owner without another create."""
    for run in adapter.reads():
        for job in run['jobs']:
            if job['type'] != 'video' or job['status'] != 'completed':
                continue
            original = WORK/'originals'/(job['key']+'.mp4')
            proof = WORK/'transfers/video-readiness'/(job['id']+'.json')
            if not original.exists() or (proof.exists() and read(proof)['sha256'] == HASH(original.read_bytes())):
                continue
            row = api.get_artifact(run['notebookId'], job['id'])
            assert row and row[0] == job['id'], 'Provider video identity mismatch'
            media = next((items for items in row[8] if isinstance(items,list) and items
                and isinstance(items[0],list) and items[0] and isinstance(items[0][0],str)
                and items[0][0].startswith('https://')), [])
            try:
                metadata, sizes = media_owner.verify_video_file(api, row, media, original)
            except media_owner.ArtifactNotReadyError:
                pass  # Keep the original, then ask the shared owner for its best rendition.
            else:
                save(proof, {'id':job['id'],'key':job['key'],'providerRawStatus':row[4],
                    'providerProof':native.settings_proof(run,job,row),'qualityVersion':1,
                    'downloadMethod':'Retained native SDK original; shared owner verified advertised sizes and complete decode; no transcoding',
                    'completeDecodePassed':True,'advertisedSizes':[list(size) for size in sizes],
                    'bytes':original.stat().st_size,'sha256':HASH(original.read_bytes()),
                    'metadata':metadata,'verifiedAt':native.NOW()})
                continue
            pending = original.with_suffix('.readiness.mp4')
            media_owner.download_original(api, run, job, pending)
            old_hash = HASH(original.read_bytes())
            if old_hash != HASH(pending.read_bytes()):
                retained = WORK/'superseded-originals'/(job['key']+'-'+old_hash+'.mp4')
                retained.parent.mkdir(parents=True, exist_ok=True)
                original.replace(retained)
            pending.replace(original)


def generate(acceptance=False, once=False):
    frozen = validate()
    # The owner explicitly released the representative-review hold on 26 October.
    # Delivery checks and content review never gate admission of this finite set.
    selected = {r['key'] for r in frozen['requests'] if not acceptance or r['acceptance']}
    base_pending = native.pending_jobs
    native.pending_jobs = lambda runs,kind: ((r,j) for r,j in base_pending(runs,kind) if j['key'] in selected)
    api = client()
    state_file = WORK/'quota-state.json'
    control = WORK/'generation-control.json'
    save(control,{'schemaVersion':1,'desiredState':'run','reconcileSeconds':30,'probeBackoffSeconds':60})
    with owner.StageLock('supervisor'), owner.StageLock('generation',WORK/'worker.lock'):
        while True:
            state = quota.load_state(state_file)
            result = worker.persistent_cycle(api,state,state_file,quota,owner,control)
            pending = [j for r in adapter.reads() for j in r['jobs'] if j['key'] in selected and j['status']=='planned']
            if pending and result['phase']=='runnable' and result.get('submittedThisCycle', 0):
                print(json.dumps({'phase':'admitting','remaining':len(pending),'counts':result['counts']}),flush=True)
                continue
            asyncio.run(worker.downloads(api,adapter.reads(),concurrency=3))
            refresh()
            jobs = [j for r in adapter.reads() for j in r['jobs'] if j['key'] in selected]
            delivered = all(j['status']=='completed' and j.get('providerProof',{}).get('settingsVerified') and (WORK/'originals'/(j['key']+'.'+native.EXT[j['type']])).exists() for j in jobs)
            print(json.dumps({'phase':result['phase'],'counts':result['counts'],'delivered':delivered,'selected':len(selected)}),flush=True)
            if delivered or once:
                break
            time.sleep(30)
    save(control,{**read(control),'desiredState':'hold'})


def download():
    validate()
    with owner.StageLock('supervisor'),owner.StageLock('generation'),owner.StageLock('delivery'):
        api=client()
        native.reconcile(api,adapter.FILES,associate=True,recover=True)
        asyncio.run(worker.downloads(api,adapter.reads(),concurrency=3))
        reconcile_video_readiness(api)
        refresh()


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action',choices=['dry-run','prepare','validate','generate','download','index'])
    parser.add_argument('--acceptance',action='store_true')
    parser.add_argument('--once',action='store_true')
    parser.add_argument('--catalogue',default=CATALOGUE)
    args=parser.parse_args()
    CATALOGUE = args.catalogue
    resolved = resolve()
    WORK = ROOT/'.local/property-pack-media/runs'/resolved['config']['id']
    DIRECTORY = WORK/'docs/generation'
    if args.action=='dry-run':
        value=resolve();print(json.dumps({'run':value['config']['id'],'sources':len(value['sources']),'requests':len(value['requests']),'providerMutations':0}))
    elif args.action=='prepare':prepare()
    elif args.action=='validate':validate();print('Frozen requests and complete indexed source reads verified')
    elif args.action=='generate':generate(args.acceptance,args.once)
    elif args.action=='download':download()
    else:refresh()
