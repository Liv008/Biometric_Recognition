var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var recognition = new SpeechRecognition();

var video;
var code;

var vidTAG;

function addSignOption(){
    document.getElementById('add').remove()
    let sign = document.getElementById('sign')

    let si = document.createElement('div');
    si.id = 'signIndiv'
    let aIn = document.createElement("a")
    aIn.id = 'signIn'
    aIn.innerHTML = 'Sign in'

    let su = document.createElement('div');
    su.id = 'signUpdiv'
    let aUp = document.createElement("a")
    aUp.id = 'signUp'
    aUp.innerHTML = 'Sign up'

    let t = document.createTextNode("Already registered? ")
    let p = document.createTextNode("Don't have an account? ")

    si.appendChild(aIn)
    su.appendChild(aUp)

    sign.appendChild(t)
    sign.appendChild(si)
    sign.appendChild(p)
    sign.appendChild(su)

    aIn.addEventListener('click', () => {
        document.getElementById('sign').remove()
        launchMedia()
        signInCanvas()
    })

    aUp.addEventListener('click', () => {
        document.getElementById('sign').remove()
        launchMedia()
        signUpCanvas()
    })
}
function move(){
    window.location.href = "http://localhost:3000";
}

function launchMedia() {
    document.getElementById('body').hidden = true;

    vidTAG = document.createElement('div');
    vidTAG.id = 'vid';

    let vid = document.createElement('video');
    vid.id = 'video';
    vid.width = 720;
    vid.height = 560;
    vid.autoplay = true;
    vid.muted = true
    vidTAG.appendChild(vid);

    document.getElementById('medias').appendChild(vidTAG)

    video = document.querySelector('video');

    navigator.mediaDevices.getUserMedia( {video: true, audio: true})
        .then((stream) => {
            video.srcObject = stream;
        });
}
function stopMedia(){
    video.srcObject.getTracks().forEach(track => track.stop());
    vidTAG.remove();
}

async function createForm() {
    let form = document.createElement("form")
    form.id = 'form'
    form.action = "app"
    form.method = "post"

    let name = document.createElement('input');
    name.name = 'name';
    name.type = 'text';
    name.id = 'name';
    name.placeholder = 'Full name';
    name.required = true;
    form.appendChild(name);

    let email = document.createElement('input');
    email.name = 'email';
    email.type = 'email';
    email.id = 'email';
    email.placeholder = 'E-mail';
    email.required = true;
    form.appendChild(email);

    let img = document.createElement('input');
    img.name = 'vid';
    img.id = 'vid';
    img.value = await getNewUser(video);
    img.type = 'hidden';
    form.appendChild(img);

    let submit = document.createElement('button');
    submit.type = 'submit'
    submit.value = 'Submit'
    submit.innerHTML = 'Submit'
    form.appendChild(submit);

    let b = document.getElementById('body')
    b.appendChild(form)
}

async function signInCanvas() {

    let canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.width = video.width
    canvas.height = video.height * 0.72
    var ctx = canvas.getContext("2d");
    ctx.font = "30px Courier New";
    ctx.fillText("Please remove hair, glasses", 20, 60)
    ctx.fillText("and headgear from face", 20, 100)
    ctx.fillText("Try to look straight to the camera", 20, 200)
    ctx.fillText("Click video to begin", 20, 300)
    vidTAG.appendChild(canvas)

    canvas.addEventListener("click", () => {
        canvas.remove()
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            video.srcObject = stream;
        }).then(() => {
            textRecognition()
        })
    }, false);
}
function signUpCanvas(){
    let canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.width = video.width*0.99
    canvas.height = video.height*0.71
    var ctx = canvas.getContext("2d");
    ctx.font = "30px Arial";
    ctx.fillText("Please remove hair from your face", 50, 60)
    ctx.fillText("glasses and headgear", 50, 100)
    ctx.fillText("Try to look straight to the camera", 50, 200)
    ctx.fillText("Click video to begin recognition", 50, 300)
    vidTAG.appendChild(canvas)

    canvas.addEventListener("click", () => {
        canvas.remove()
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            video.srcObject = stream;
        }).then(() => {
            createForm()
        })
    }, false);
}

async function faceRecognition(input) {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('face-api.js/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('face-api.js/weights'),
        faceapi.nets.faceRecognitionNet.loadFromUri('face-api.js/weights'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('face-api.js/weights')
    ])

    const dbDescriptors = await getDescriptorsFromDatabase()
    const detectionFromVideo = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
    console.log(detectionFromVideo.descriptor)

    const faceMatcher = new faceapi.FaceMatcher(dbDescriptors, 0.45)
    const bestMatch = faceMatcher.findBestMatch(detectionFromVideo.descriptor)

    let form = document.createElement("form")
    form.id = 'form'
    form.action = "welcome"
    form.method = "post"

    let mat = document.createElement('input');
    mat.name = 'mat';
    mat.id = 'mat';
    mat.value = bestMatch.label;
    mat.type = 'hidden';

    form.appendChild(mat);

    let b = document.getElementById('body')
    b.appendChild(form)

    form.submit()
}
async function getDescriptorsFromDatabase(){

    const res = await fetch('/ap')
    const data = await res.json()

    const labels = []
    for (var b in data){
        labels.push("" + data[b].UserID)
    }

    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (var i in data){
                let entries = data[i].Biometrics.split(',')
                let arr = new Float32Array(entries)
                descriptions.push(arr)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

async function getNewUser(video){
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('face-api.js/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('face-api.js/weights'),
        faceapi.nets.faceRecognitionNet.loadFromUri('face-api.js/weights'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('face-api.js/weights')
    ])
    const face = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
    const dbDescriptors = await getDescriptorsFromDatabase()

    const faceMatcher = new faceapi.FaceMatcher(dbDescriptors, 0.45)
    const bestMatch = faceMatcher.findBestMatch(face.descriptor)
    if (bestMatch.label !== 'unknown'){
        let canvas = document.createElement('canvas')
        canvas.id = 'canvas'
        canvas.width = video.width*0.99
        canvas.height = video.height*0.71
        var ctx = canvas.getContext("2d");
        ctx.font = "30px Arial";
        ctx.fillText("You already have an account", 50, 60)
        ctx.fillText("Click here to log in", 50, 100)
        vidTAG.appendChild(canvas)
        canvas.addEventListener("click", () => {
            canvas.remove()
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then(stream => {
                video.srcObject = stream;
            }).then(() => {
                signInCanvas()
            })
        }, false);

    } else {
        stopMedia()
        document.getElementById('body').hidden = false;
        return face.descriptor
    }
}

function textRecognition() {
    var numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    var grammar = '#JSGF V1.0; grammar numbers; public <numbers> = ' + numbers.join(' | ') + ' ;'
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let codeCheck = false;

    code = generateCode();

    let canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.width = video.width
    canvas.height = video.height*0.72
    var ctx = canvas.getContext("2d");
    ctx.font = "30px Courier New";
    ctx.fillText("Say aloud the code below", 20, 60)
    ctx.fillText(code, 50, 160)
    vidTAG.appendChild(canvas)

    recognition.start()

    recognition.onresult = (event) => {
        let input = event.results[0][0].transcript.toString();
        if (equals(code, input)) {
            codeCheck = true
        } else {
            codeCheck = false
        }
        recognition.stop();
    }

    recognition.onspeechend = async () => {
        canvas.remove()
        if (codeCheck === true) {
            await faceRecognition(video)
        } else {
            let canvas2 = document.createElement('canvas')
            canvas2.id = 'canvas'
            canvas2.width = video.width
            canvas2.height = video.height * 0.72
            var ctx = canvas2.getContext("2d");
            ctx.font = "30px Courier New";
            ctx.fillText("Wrong code. Click here to try again", 20, 60)
            vidTAG.appendChild(canvas2)

            canvas2.addEventListener("click", () => {
                canvas2.remove()
                signInCanvas()
            }, false);
        }
    }
}
function equals(a, b) {
    let bool = 0;

    if (a.length !== b.length)
        return false;
    else {
        for (let i = 0; i < a.length; i++) {
            let k = parseInt(a[i])
            let l = parseInt(b[i])
            if(k === l )
                bool += 1;
        }
        if (bool === a.length)
            return true;
        else
            return false
    }
}
function generateCode() {
    let code = '';
    for (let i = 0; i < 4; i++) {
        code = code + Math.floor(Math.random() * 10);
    }
    return code;
}