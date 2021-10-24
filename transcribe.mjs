// import { 
//     $,
//     $$,
//     $Id,
//     listen as listenFor,
//     Observer,
//     MapObserver,
//     TimeConversion,
//     HtmlElementWrapper as heWrapper
// } from './js/utils.mjs';
import {
    dispatchDisplayErrorMessage
} from './js/components/events.mjs'
import {
    $,
    $$,
    $Id,
    listen as listenFor,
    Observer,
    MapObserver,
    TimeConversion,
    HtmlElementWrapper as heWrapper,

    theApp,
    Core,
    // MediaItemBuilder,
    // MediaFileBlobProvider,
    // MediaPlayer
    // mpLoaderSettings,
    // transcriptMediaPlayerLoader
} from './js/app.mjs'

const mediaMetaDataRestClient = theApp.mediaMetaDataRestClient;

Core.Media.MediaPlayer.mpLoaderSettings.mediaItemBuilder = Core.Media.MediaItemBuilder.createUsing;
Core.Media.MediaPlayer.mpLoaderSettings.mediaBlobProvider = new Core.Media.MediaFileBlobProvider().loadBlobTo;
Core.Media.MediaPlayer.mpLoaderSettings.metadataProvider = async () => { return await mediaMetaDataRestClient.getById(1); };

Core.Media.MediaPlayer.transcriptMediaPlayerLoader(Core.Media.MediaPlayer.mpLoaderSettings);

listenFor('click', '#clearTranscripts', handleClearTranscripts);
listenFor('change', '#transcriptFileSource', handleJsonFileSelect);

document.addEventListener('speaking', handleSpeaking);
// listenFor('speaking', '#mediaPlayer', handleSpeaking);
listenFor('playing', '#mediaPlayer', handleMediaPlaying);
listenFor('ended', '#mediaPlayer', handleMediaEnded);
listenFor('seeked', '#mediaPlayer', handleMediaSeeked);

const nbsp = document.createTextNode('\u00A0');
const meatballs = heWrapper
    .generate('button', '\u2026') //&#8230; &#x2026; &hellip;
    .addClass('toolButton')
    .element;
const kebab = heWrapper
    .generate('button', '\u22EE') //&#8942; &#x22EE; &vellip;
    .addClass('toolButton')
    .element;
// const hamburger = document.createTextNode('&#8801; &#x2261; &equiv;');

var transcriptData;
const speakersList = $('#speakersContainer>ul');
const speakers = new Map();
// var speakersObserver = new ArrayObserver(Array.from(speakers, (v, k) => k));
const speakersObserver = new MapObserver(speakers);
speakersObserver.Observe(function(result, method){
    switch (method) {
        case 'set':
            let speaker = speakers.get(result);
            let speakersListItem = $(`#speaker_${result}`, speakersList);
            let speakerIndex = Array.from(speakers.keys()).indexOf(speaker.speakerName)+1;

            if(!speakersListItem) {
                let dfContainer = document.createDocumentFragment();

                let speakerElement = heWrapper
                    .generate('span', speaker.speakerName)
                    .addClass(`speaker-${speakerIndex}`)
                    .element;
                speakerElement.id = `speaker_${result}`;
                speakerElement.contentEditable = true;
                speakerElement.oninput = e => speaker.speakerName = e.target.innerText;

                dfContainer.appendChild(speakerElement);
                
                speaker.speakerObserver.Observe(newValue => {
                    let speakerSectionLabels = $$(`dfn[data-speaker=${result}]`);
                    speakerSectionLabels.forEach(element => {
                        element.innerText = newValue;
                    });
                });

                let speakerSegmentsList = heWrapper
                    .generate('details', null, true, dfContainer)
                    .createChildAndUse('ol');
                speaker.segments.forEach(segment => {
                    speakerSegmentsList.createChild('li', `${TimeConversion.secondsToTime(segment.start_time)}-${TimeConversion.secondsToTime(segment.end_time)}`);
                });

                speakersListItem = heWrapper
                    .generate('li', null, true, speakersList)
                    .addClass(`speaker-${speakerIndex}`)
                    .element
                    .appendChild(dfContainer);
            } else {
                let speakerSegmentsList = $('ol', speakersListItem.parentNode);
                // let speakerItems = speaker.segments.reduce((p, c) => {
                //     if(p) {
                //         p.end_time = c.end_time;
                //         p.items.join(c.items);
                //     }
                // });
                let segment = speaker.segments[speaker.segments.length-1];
                speakerSegmentsList.appendChild(heWrapper.generate('li', `${TimeConversion.secondsToTime(segment.start_time)}-${TimeConversion.secondsToTime(segment.end_time)}`).element);
            }
            break;
        case 'clear':
            speakersList.innerHTML = '';
            break;
        default:
            break;
    }
});

var startTimes;
var lastStartTime;
var currentDialogue;
var previousDialogue;

const transcriptInfo = $('#infoTranscriptContainer>ul');
const transcriptWrapper = $Id('segmentedTranscriptContainer');
const transcriptWrapperOffSetTop = transcriptWrapper.offsetTop;
// transcriptWrapper.addEventListener("scroll", event => scrollOutput.textContent = `scrollTop: ${transcriptWrapper.scrollTop}`);

function _displayError(message) {
    dispatchDisplayErrorMessage(message);
}

function handleJsonFileSelect(evt) {
    const files = evt.target.files;
    for (let i = 0, f; f = files[i]; i++) {
        let reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                console.log(`loading json: ${theFile.name}`);

                let transcriptFileName = $Id('transcriptFileName');
                if(transcriptFileName.firstChild?.nodeType === transcriptFileName.TEXT_NODE) transcriptFileName.removeChild(transcriptFileName.firstChild);
                transcriptFileName.appendChild(document.createElement('li')).textContent = theFile.name;
                
                transcriptData = JSON.parse(e.target.result);
                
                displayTranscriptResults(transcriptData.results);

                startTimes = transcriptData.results.items.filter(o => o.type !== 'punctuation').map(o => Number(o.start_time));
            };
        })(f);

        reader.readAsText(f);
    }
}

function displayTranscriptResults(transcriptResults) {
    const speakerLabels = transcriptResults.speaker_labels;
    
    transcriptInfo.appendChild(populateTranscriptInfo(transcriptData.jobName, transcriptResults, speakerLabels));

    populateRawTranscripts(transcriptResults.transcripts);

    const items = buildTranscriptItems(transcriptResults.items);

    populateTranscriptSegments(speakerLabels.segments, speakers, items);
}

function populateTranscriptInfo(jobName, transcriptResults, speakerLabels) {
    let infoContainer = document.createDocumentFragment();
    
    infoContainer.appendChild(heWrapper.generate('li', `Job Name: ${jobName}`).element);
    infoContainer.appendChild(heWrapper.generate('li', `Language: ${transcriptResults.language_code}`).element);
    let languagesInfoList = heWrapper
        .generate('li', `Languages detected:`)
        .createChildAndUse('ol');
    transcriptResults.language_identification.forEach(o => languagesInfoList.createChild('li', `${o.code} (${o.score})`));
    infoContainer.appendChild(languagesInfoList.element);
    infoContainer.appendChild(heWrapper.generate('li', `Number of speakers: ${speakerLabels.speakers}`).element);
    infoContainer.appendChild(heWrapper.generate('li', `Number of segments: ${speakerLabels.segments.length}`).element);
    infoContainer.appendChild(heWrapper.generate('li', `Estimated number of words: ${transcriptResults.items.filter(o => o.type !== 'punctuation').length}`).element);

    return infoContainer;
}

function populateRawTranscripts(transcripts) {
    const rawTranscriptContainer = $Id('rawTranscriptContainer');
    transcripts.forEach(transcriptItem => {
        rawTranscriptContainer.appendChild(heWrapper.generate('p', transcriptItem.transcript).element);
    });
}

function buildTranscriptItems(transcriptItems) {
    var lastEndTime;
    var lastStartTime;

    return transcriptItems.map(item => {
        let startTime = item.start_time ? Math.round(lastStartTime = item.start_time * 1000) : lastStartTime;
        let endTime = item.end_time ? Math.round(lastEndTime = item.end_time * 1000) : lastEndTime;

        let itemContainer = heWrapper
            .generate('span', item.alternatives[0].content)
            .click(handleWordSelected)
            .element;
        if(item.type !== 'punctuation') {
            itemContainer.id = 'segment_item_' + startTime;
            itemContainer.dataset.duration_ms = Math.round(endTime - startTime);
            itemContainer.classList.add('dialogue');
        }
        itemContainer.dataset.type = item.type;
        itemContainer.dataset.start_time = startTime;
        itemContainer.dataset.end_time = endTime;
        itemContainer.dataset.confidence = item.alternatives[0].confidence;

        return itemContainer;
    });
}

function populateTranscriptSegments(transcriptSegments, transcriptSpeakers, transcriptItems) {
    const segmentsContainer = $Id('segmentedTranscriptContainer');

    transcriptSegments.forEach((segment, index) => {
        if(!transcriptSpeakers.has(segment.speaker_label)){
            let speaker = { 
                speakerName: segment.speaker_label, 
                segments: [segment], 
                //TODO: Use bind()...?
                get speakerObserver() {
                    Object.defineProperty(this, "speakerObserver", { value: new Observer(this, 'speakerName'), writable: false});
                    return this.speakerObserver;
                }
            };

            transcriptSpeakers.set(segment.speaker_label, speaker);
        } else {
            let speaker = transcriptSpeakers.get(segment.speaker_label);
            speaker.segments.push(segment);
            transcriptSpeakers.set(segment.speaker_label, speaker);
        }

        let speakerIndex = Array.from(transcriptSpeakers.keys()).indexOf(segment.speaker_label)+1;
        let segmentStartTime = Math.round(segment.start_time * 1000);
        let segmentEndTime = Math.round(segment.end_time * 1000);

        let segmentContainer = document.createDocumentFragment();

        segmentContainer.appendChild(heWrapper.generate("time", TimeConversion.secondsToTime(segment.start_time)).element);
        segmentContainer.appendChild(document.createTextNode(" - "));
        segmentContainer.appendChild(heWrapper.generate("time", TimeConversion.secondsToTime(segment.end_time)).element);

        let segmentEditTool = segmentContainer.appendChild(kebab.cloneNode(true));
        segmentEditTool.classList.add("simptip-info");
        segmentEditTool.classList.add("simptip-position-right");
        segmentEditTool.dataset.bind = `transcriptResults.speaker_labels.segments[${index}].speaker_label`;
        segmentEditTool.dataset.tooltip= "Click to edit";
        segmentEditTool.onclick = handleSegmentLabelClick;

        let segmentLabelContainer = segmentContainer.appendChild(heWrapper
            .generate('span')
            .addClass('segmentLabel')
            .addClass(`speaker-${speakerIndex}`)
            .click(handleSegmentLabelClick)
            .element);
        segmentLabelContainer.dataset.bind = `transcriptResults.speaker_labels.segments[${index}].speaker_label`;
        segmentLabelContainer.innerHTML = `<dfn id="${segment.speaker_label}_segment_${index}" data-speaker="${segment.speaker_label}">${segment.speaker_label}</dfn>:`;

        let segmentItemsContainer = segmentContainer.appendChild(document.createElement('p'));
        let segmentItems = transcriptItems.filter(item => item.dataset.start_time >= segmentStartTime && item.dataset.end_time <= segmentEndTime);
        segmentItems.forEach(segmentItem => {
            if(segmentItem.dataset.type !== 'punctuation') segmentItemsContainer.appendChild(document.createTextNode(' '));
            else segmentItem.classList.add('punctuation');
            segmentItemsContainer.appendChild(segmentItem);
        });

        segmentsContainer
            .appendChild(heWrapper.generate('blockquote').element)
            .appendChild(segmentContainer);
    });
}

function handleMediaPlaying(e) {
    if(!transcriptData) {
        e.preventDefault();

        console.error('No transcript loaded! There are no transcript file loaded.');
        
        _displayError('No transcript loaded! Load a AWS transcript json file');

        return e.returnValue = false;
    }
}

function handleMediaEnded(e) {
    previousDialogue?.classList.remove('speaking');
    previousDialogue?.classList.add('spoke');
    currentDialogue?.classList.remove('speaking');
    currentDialogue?.classList.add('spoke');
}

function handleMediaSeeked(e) {
    if(!transcriptData) return;

    $$('span.dialog', transcriptWrapper).forEach(o => {
        o.classList.remove('speaking');
        // o.classList.remove('spoke');
    });

    let currentTime = e.target.currentTime;
    let previousStartTime = currentTime;
    startTimes = transcriptData.results.items
        .filter(o => {
            let isNotPuctuation = o.type !== 'punctuation';
            let mustInclude = o.start_time >= currentTime;
            if(!mustInclude && isNotPuctuation) previousStartTime = Number(o.start_time);
            return mustInclude && isNotPuctuation;
        })
        .map(o => Number(o.start_time));
    if(previousStartTime === 0) {
        transcriptWrapper.scrollTop = 0;
        return;
    }
    else if(e.target.ended) return;

    if(previousStartTime < startTimes[0]) startTimes.unshift(previousStartTime);

    document.dispatchEvent(new CustomEvent('speaking', { detail: currentTime }));
}

function handleSpeaking(e) {
    if(!transcriptData) return;

    let currentTime = Number(Number(e.detail).toFixed(2));
    let startTime = Number(Number(startTimes[0]).toFixed(2));

    // console.log(`${currentTime} | ${startTime}`);

    if(currentTime > startTime){
        lastStartTime = startTimes.shift();
        startTime = Number(Number(startTimes[0]).toFixed(2));
        previousDialogue = currentDialogue;
    } 
    else return;

    if(lastStartTime > currentTime) return;

    currentDialogue = $(`#segment_item_${Math.round(startTime * 1000)}`, transcriptWrapper);
    if(currentDialogue) {
        currentDialogue.classList.remove('spoke');
        currentDialogue.classList.add('speaking');
        previousDialogue?.classList.remove('speaking');
        previousDialogue?.classList.add('spoke');
        
        transcriptWrapper.scrollTop = currentDialogue.offsetTop - transcriptWrapperOffSetTop-60;
    }

    // console.log(`${lastStartTime} | ${startTime} (${Math.round(startTime * 1000)}) | ${currentDialogue?.textContent}`);
}

function handleClearTranscripts(e) {
    transcriptData = null;
    if(speakers) speakers.clear();
    startTimes = [];
    lastStartTime = null;
    currentDialogue = null;
    previousDialogue = null;
    $Id('transcriptFileSource').value = null;
    $Id('infoTranscriptContainer').innerHTML = "";
    $Id('segmentedTranscriptContainer').innerHTML = "";
    $Id('rawTranscriptContainer').innerHTML = "";
    $$('#transcriptFileName>li').forEach(o => o.parentNode.removeChild(o));
}

function handleSegmentLabelClick(e) {
    _displayError(`Show Model: ${e.target.dataset.bind}`);
    // alert(`Show Model: ${e.target.dataset.bind}`);
}

function handleWordSelected(e) {
    previousDialogue = null;
    lastStartTime = null;
    mediaPlayer.seek(e.target.dataset.start_time/1000);
}

function handleSpeakerSelected(e) {
    alert(`Show Model: ${e.target.id}`);
}