// use this file to set state for NavPanel, etc. 
// on Portfolio Index page when loaded

/************************************************/
/*                                              */
/*   Porta3D.js - Data Visualization Tool       */
/*   Standalone Version                         */
/*   Copyright (c) 2016, Metagraphos            */
/*   Developed by: Ernesto Riestra M.           */
/*   Developed for: StockSmart Inc              */
/*   Updated by Keith MacKay                    */
/*                                              */
/************************************************/

// UI interactions with form

// set these to white whenever anything typed
// (could be red from error condition, but want to clear that if user is correcting)
//$('#txtPortfolioInput').on('change input', function () {
//    var strongRegex = new RegExp("^(?=.*[0-9])(?=.{9,})")

//    // if not blank, check strength
//    if ($('#txtPortfolioInput').val() !== '') {
//        if (strongRegex.test($('#txtPortfolioInput').val())) {
//            // strong -- color green
//            $('#txtPortfolioInput').css("background-color", "#dff0d8");
//            //$('#strengthtxt').text('(strong)');
//            //$('#strengthtxt').addClass('text-success');
//            //$('#strengthtxt').removeClass('text-danger');
//            $('#txtPortfolioInput').addClass('has-success');
//            $('#txtPortfolioInput').removeClass('has-error');
//        }
//        else {
//            // not strong -- color red
//            $('#txtPortfolioInput').css("background-color", "#f2dede");
//            //$('#strengthtxt').text('(weak)');
//            //$('#strengthtxt').addClass('text-danger');
//            //$('#strengthtxt').removeClass('text-success');
//            $('#txtPortfolioInput').addClass('has-error');
//            $('#txtPortfolioInput').removeClass('has-success');
//        }
//    }
//    else {
//        // pw blank, so hide strength indicator
//        $('#txtPortfolioInput').css("background-color", "#fff");
//        //$('#strengthtxt').text('');
//        //$('#strengthtxt').removeClass('text-danger');
//        //$('#strengthtxt').removeClass('text-success');
//        $('#txtPortfolioInput').removeClass('has-success');
//        $('txtPortfolioInput').removeClass('has-error');
//    }
//});

// $('#portfolioform').submit(function () {
   //  console.log($('#txtPortfolioInput').val());
   //  $('#portcubeframe').prop('src', '/Portfolio/Testv1/' + $('#txtPortfolioInput').val());
   // return false;
// });

// CONFIG settings, contains general styles and titles
// for the overall visualization model

config = {
    "c": {
        "format": "{:.1f}",
        "gradient": [
            [
                0,
                "#53BB6A"
            ],
            [
                0.5,
                "#F1DB24"
            ],
            [
                1,
                "#EE3131"
            ]
        ],
        "path": "TRX",
        "style": "l",
        "title": "Ainstein Rating"
    },
    "id": {
        "path": "TTS",
        "title": "Ticker Symbol"
    },
    "name": {
        "path": "TTN",
        "title": "Name"
    },
    "start": "Trades",
    "v": {
        "format": "M",
        "path": "TPE",
        "title": "Market Cap"
    },
    "x": {
        "format": "{:.1f}",
        "path": "TRX",
        "title": "Trading Risk",
        "min_s": "Low Risk",
        "max_s": "High Risk"
    },
    "y": {
        "format": "{:.1f} X",
        "path": "TPE",
        "title": "Value (PE Multiple)",
        "min_s": "Good Value",
        "max_s": "Overpriced"
    },
    "z": {
        "format": "{:.1f} %",
        "path": "TEG",
        "title": "Earnings Growth",
        "min_s": "Poor Growth",
        "max_s": "Good Growth"

    },
    "custom": [],
    "version": 6.0,
    "flip": [1, -1, -1]
}

function addCommas(intNum) {
    return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

// Porta sort functions

function lerpColor(startColor, endColor, value) {

    sCol = startColor.replace("#", "");

    sR = parseInt(sCol.substring(0, 2), 16)
    sG = parseInt(sCol.substring(2, 4), 16)
    sB = parseInt(sCol.substring(4, 6), 16)

    eCol = endColor.replace("#", "");
    eR = parseInt(eCol.substring(0, 2), 16)
    eG = parseInt(eCol.substring(2, 4), 16)
    eB = parseInt(eCol.substring(4, 6), 16)

    hR = (sR + value * (eR - sR)).toString(16);
    hG = (sG + value * (eG - sG)).toString(16);
    hB = (sB + value * (eB - sB)).toString(16);

    return ("#" + hR + hG + hB)
}

function setColorRange() {

    size = data['data'].length;

    minVal = data['data'][0]['c_v'];
    maxVal = data['data'][0]['c_v'];

    for (var index = 0; index < size - 1; index++) {
        val = data['data'][index]['c_v'];
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
    }

    data['config']['c']['min'] = minVal;
    data['config']['c']['max'] = maxVal;

    data['config']['c']['min_s'] = minVal.toFixed(2);
    data['config']['c']['max_s'] = maxVal.toFixed(2);
}

function interpColor(val) {

    size = data['data'].length;

    style = data['config']['c']['style']
    colors = data['config']['c']['gradient']

    // minVal and maxVal are used to control if the colors
    // should be absolute or normalized

    minVal = data['config']['c']['min'];
    maxVal = data['config']['c']['max'];

    val = (val - minVal) / (maxVal - minVal);

    if (colors.length < 2) {
        return colors[0][0]; // nothing to interpolate
    }

    fromColor = colors[0][1];
    toColor = colors[1][1];
    interp = 0;

    // find where value is in the colors array
    for (var index = 0; index < colors.length - 1; index++) {

        if ((val >= parseFloat(colors[index][0]) && (val <= parseFloat(colors[index + 1][0])))) {
            fromColor = colors[index][1];
            toColor = colors[index + 1][1];
            interp = (val - parseFloat(colors[index][0])) / (parseFloat(colors[index + 1][0]) - parseFloat(colors[index][0]));
        }

        // interpolate color into hex code
        if (style == "q") {
            interp = 0;
        } // step wise interpolation (for discrete color groups)
    }

    return lerpColor(fromColor, toColor, interp);
}

function adjustVolumes() {
    size = data['data'].length;
    k = 50;
    factor = 1 / Math.pow(1 + Math.exp(-size / k), 3);

    for (var index = 0; index < size; index++) {
        data['data'][index]['v'] = factor * data['data'][index]['v'];
    }
}

function jsonToData(json, hl) {
    //earningsgrowth was PS
    //pemultiple was SJ
    //tradingrisk was EF
    highlightId = hl;

    dataElement = []
    console.log(json)

    for (var i = 0; i < json.data.length; i++) {

        item = {}

        //stuffing data from json into local variable for passage to axes and color vectors. change axis/color target by changing x/y/z denomination
        //c = color, v=sphere diameter, xyz=axes, v=initial data value, f=fixed value for display
        //remember to change titles as well!

        item['id'] = json.data[i]['id'];
        item['name'] = json.data[i]['name'];

        item['c_v'] = parseFloat(json.data[i]['overallrating']);
        item['c_f'] = item['c_v'].toFixed(1)

        item['v_v'] = parseFloat(json.data[i]['marketcap']);
        item['v_f'] = item['v_v'].toFixed(0) //KJM + " habs."

        item['x_v'] = parseFloat(json.data[i]['overallrating']);
        item['x_f'] = item['x_v'].toFixed(1)

        item['y_v'] = parseFloat(json.data[i]['pemultiple']);
        item['y_f'] = item['y_v'].toFixed(1)

        //when we want trading risk to be independent of overall rating, change this back to 'tradingrisk'
        //item['z_v'] = parseFloat(json.data[i]['tradingrisk']);
        item['z_v'] = parseFloat(json.data[i]['earningsgrowth']);
        item['z_f'] = item['z_v'].toFixed(3)

        item['esg_risk'] = parseFloat(json.data[i]['tradingrisk']);
        dataElement.push(item)
    }

    data['data'] = dataElement

    setColorRange();

    for (var i = 0; i < json.data.length; i++) {

        item = dataElement[i];

        item['x'] = parseFloat(json.data[i]['overallrating']);
        item['y'] = parseFloat(json.data[i]['pemultiple']);
        //        item['z'] = parseFloat(json.data[i]['tradingrisk']);
        item['z'] = parseFloat(json.data[i]['earningsgrowth']);
        item['c'] = interpColor(parseFloat(json.data[i]['overallrating']));
        dataElement[i] = item;
    }

    data['data'] = dataElement

    normalizeVolumes();
    volumeSort('x', '_v');
    volumeSort('y', '_v');
    volumeSort('z', '_v');
    adjustVolumes();
}

function normalizeVolumes() {

    size = data['data'].length;

    minVal = data['data'][0]['v_v'];
    maxVal = data['data'][0]['v_v'];

    totalLength = 0;

    for (var index = 0; index < size; index++) {
        totalLength += Math.pow(data['data'][index]['v_v'], 1.0 / 3)
    }

    for (var index = 0; index < size; index++) {
        val = data['data'][index]['v_v'];
        data['data'][index]['v'] = Math.pow(val, 1 / 3) / totalLength;
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
    }

    data['config']['v']['min'] = minVal;
    data['config']['v']['max'] = maxVal;

    data['config']['v']['min_s'] = minVal.toFixed(2);
    data['config']['v']['max_s'] = maxVal.toFixed(2);
}

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function volumeSort(axis, pfix) {

    var size = data['data'].length;

    var in_field = axis + pfix;
    var out_field = axis;

    var minVal = data['data'][0][in_field];
    var maxVal = data['data'][0][in_field];
    var zeroCrossing = 0;

    var pos = 0;

    data['data'] = sortByKey(data['data'], in_field);

    for (var index = 0; index < size; index++) {

        var val = data['data'][index][in_field];
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);

        pos = pos + data['data'][index]['v'];
        data['data'][index][out_field] = pos;

        if (index > 0) {
            var val_ = data['data'][index - 1][in_field];
            if (val > 0 && val_ < 0) {
                zeroCrossing = (0 - val_ / (val - val_) + index) / size;
            }
        }
    }

    data['config'][out_field]['min'] = minVal;
    data['config'][out_field]['max'] = maxVal;

    if (zeroCrossing != 0) {
        data['config'][out_field]['zero'] = zeroCrossing;
    }

    collapseSame(axis, pfix);
}

function collapseSame(axis, pfix) {
    size = data['data'].length;
    avIndex = 1;
    average = data['data'][0][axis];

    for (var index = 1; index < size - 1; index++) {
        if (data['data'][index][axis + pfix] == data['data'][index - 1][axis + pfix]) {
            average = average * avIndex;
            average = average + data['data'][index][axis];
            average = average / (avIndex + 1);

            for (var jndex = index - avIndex; index < size; index++) {
                data['data'][jndex][axis] = average;
            }

            avIndex = avIndex + 1;

        } else {
            avIndex = 1;
            average = data['data'][index][axis];
        }
    }
}

var data = {};
var json = {};

data['config'] = config;

var highlightId = ""; // use this if you want to start with something highlighted

// Original JS script for Porta3D

var controls, container;
var INTERSECTED, LASTINTERSECTED, SHOWLABEL;
var targetList = [];
var mouse = {
    x: 0,
    y: 0
};
var ec = {
    x: 0,
    y: 0
};
var projector = {
    x: 0,
    y: 0
};
var keys = {

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    BOTTOM: 40,
    L: 76,
    G: 71,
    D: 68,
    H: 72,
    S: 83,
    X: 88,
    ESC: 27


};
var demoStart = 7;
var clock;
var deltaTime = 0;
var lastTime = (new Date()).getTime();
var currentTime = (new Date()).getTime();
var titles = false;
var lastEvent = "mouseUp";
var button = "none";

/************************************************/
//      VISUALIZATION SETTINGS & VARIABLES
/************************************************/

var darkSkin = true;
var showGuides = true;
var snapOrtho = true;
var orthoCamera = false;
var isMoving = false;
var extend = true;

var sliceX = 0;
var sliceY = 0;
var sliceZ = 0;

var crossHair = {
    x: 0,
    y: 0,
    z: 0
};

var scene = new THREE.Scene();
var scene2 = new THREE.Scene(); // for transparent items

var referenceCube = new THREE.Object3D();
var labels = new THREE.Object3D();
var dataPoints = new THREE.Object3D();
var axisTitles = new THREE.Object3D();
var dolly = new THREE.Object3D();
var cameraSpot = new THREE.Object3D();
var crossHairObject = new THREE.Object3D();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
var demo = "True";

/************************************************/
//            TWEENING VARIABLES
/************************************************/

var tweenInterp = {
    cam: 0,
    timeline: 0,
    theta: 0,
    phi: 0,
    cameraSpotY: 0,
    extend: 0
}

var camTween = new TWEEN.Tween(tweenInterp);
var snapTween = new TWEEN.Tween(tweenInterp);
var extendTween = new TWEEN.Tween(tweenInterp);

/************************************************/
//                SKIN SETTINGS
/************************************************/

var cubeLnColor = 0x888888;
var cubeBgColor;
var cubeLnWidth = 2;
var sliceLnWidth = 1;
var crossHairLnWidth = 1;


/************************************************/
//            DISPLAY INFO SETTINGS
/************************************************/

var TitleX = "TitleX";
var TitleY = "TitleY";
var TitleZ = "TitleZ";

var fromX = "MinX";
var toX = "MaxX";
var fromY = "MinY";
var toY = "MaxY";
var fromZ = "MinZ";
var toZ = "MaxZ";

var cTag000 = ""
var cTag001 = ""
var cTag010 = ""
var cTag011 = ""
var cTag100 = ""
var cTag101 = ""
var cTag110 = ""
var cTag111 = ""


var formatedData;


/************************************************/
//            RIGHT ORDER OF EVENTS
/************************************************/

// LOAD THE CUBE MODEL AND SETUP SCENE
// LOAD THE SETTINGS AND DATA
// PREPARE TO DISPLAY / TWEEN DISPLAY
// KEEP THE RENDERING LOOP GOING

// this is the empty div container for the display box.
var text = document.createElement('div');
document.body.appendChild(text);
text.className = "details_title";


$(document).ready(function () {
    init();
    lapTime("Load Data");

    //KM 2021-05-11 -- sometimes succeeds on next line immediately (< .3s) -- sometimes hangs for up to 10 s before server error 500
    $.getJSON(url, function (resp) {
        json = resp;
    })
        .done(function () {
            console.log(json);
            loadDataLocally();
        })
        .fail(function () {
            console.log('Error in getJSON');
            json = {
                "data": [{
                    "overallrating": "1.88",
                    "id": "KYO",
                    "name": "Kyocera",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.2",
                    "pemultiple": "0.2",
                    "tradingrisk": "1.88"
                }, {
                    "overallrating": "1.88",
                    "id": "GOOG",
                    "name": "Google",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.42396788774935",
                    "pemultiple": "0.32647820948476",
                    "tradingrisk": "1.88"
                }, {
                    "overallrating": "2.16",
                    "id": "CMG",
                    "name": "Chipotle Mexican Grill",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.34809773479282",
                    "pemultiple": "0.27679127345494",
                    "tradingrisk": "2.16"
                }, {
                    "overallrating": "1.3253897337591",
                    "id": "RL",
                    "name": "Ralph Lauren",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.48626284158877",
                    "pemultiple": "0.35133585467306",
                    "tradingrisk": "0.48779103749726"
                }, {
                    "overallrating": "0.80581267132125",
                    "id": "IRBT",
                    "name": "iRobot",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.33697035185908",
                    "pemultiple": "0.17341051672794",
                    "tradingrisk": "0.29543180273423"
                }, {
                    "overallrating": "0.83017960064183",
                    "id": "AAPL",
                    "name": "Apple Inc",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.31477722944459",
                    "pemultiple": "0.044906362046799",
                    "tradingrisk": "0.47049600915043"
                }, {
                    "overallrating": "1.143005439313",
                    "id": "WPPGY",
                    "name": "WPP PLC",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.31619411112125",
                    "pemultiple": "0.24137648814208",
                    "tradingrisk": "0.58543484004964"
                }, {
                    "overallrating": "1.4628806458685",
                    "id": "APC",
                    "name": "Anadarko Petroleum",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.277671801514",
                    "pemultiple": "0.49067501091126",
                    "tradingrisk": "0.69453383344328"
                }, {
                    "overallrating": "1.0790015408423",
                    "id": "ORCL",
                    "name": "Oracle Corp",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.3737127312236",
                    "pemultiple": "0.18895969400072",
                    "tradingrisk": "0.51632911561797"
                }, {
                    "overallrating": "1.2286314759282",
                    "id": "DIS",
                    "name": "Walt Disney Co",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.46276770226446",
                    "pemultiple": "0.26681825715052",
                    "tradingrisk": "0.49904551651317"
                }, {
                    "overallrating": "1.3836599599952",
                    "id": "NOK",
                    "name": "Nokia Corp",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.49523858689628",
                    "pemultiple": "0.31134235524983",
                    "tradingrisk": "0.57707901784914"
                }, {
                    "overallrating": "1.3868092413904",
                    "id": "NFLX",
                    "name": "Netflix Inc",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.43064767027087",
                    "pemultiple": "0.3219466456554",
                    "tradingrisk": "0.63421492546413"
                }, {
                    "overallrating": "1.4188688339694",
                    "id": "GLNG",
                    "name": "Golar Long",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.54792182103673",
                    "pemultiple": "0.38042106028328",
                    "tradingrisk": "0.49052595264939"
                }, {
                    "overallrating": "0.77889579266995",
                    "id": "GENZ",
                    "name": "Genzyme",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.12738603675565",
                    "pemultiple": "0.20619636283666",
                    "tradingrisk": "0.44531339307764"
                }, {
                    "overallrating": "0.79416702523776",
                    "id": "MTN",
                    "name": "Vail Resorts",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.19632119565106",
                    "pemultiple": "0.13978889832963",
                    "tradingrisk": "0.45805693125706"
                }, {
                    "overallrating": "1.3219440749596",
                    "id": "EEM",
                    "name": "iShares MSCI Emerging Ma",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.41804726427373",
                    "pemultiple": "0.45577651810769",
                    "tradingrisk": "0.4481202925782"
                }, {
                    "overallrating": "1.256272519451",
                    "id": "DF",
                    "name": "Dean Foods Co",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.47079168519457",
                    "pemultiple": "0.2152322542551",
                    "tradingrisk": "0.57024858000128"
                }, {
                    "overallrating": "1.1940530473096",
                    "id": "XOM",
                    "name": "Exxon Mobil Corp",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.48232553657339",
                    "pemultiple": "0.30684878948962",
                    "tradingrisk": "0.40487872124658"
                }, {
                    "overallrating": "0.96972683053131",
                    "id": "PG",
                    "name": "Procter & Gamble Co",
                    "marketcap": "100000000",
                    "earningsgrowth": "0.41340840843453",
                    "pemultiple": "0.15650980078898",
                    "tradingrisk": "0.39980862130779"
                }]
            };
            loadDataLocally(); // loading local data after error

        });
});

// Testing Labels placed directly on WebGL

var xLabel = 0;
var yLabel = 0;

var hoverID = "ID";
var hoverName = "";
hoverXTitle = "";
hoverYTitle = "";
hoverZTitle = "";
hoverCTitle = "";
hoverVTitle = "";
hoverXValue = "";
hoverYValue = "";
hoverZValue = "";
hoverCValue = "";
hoverVValue = "";
hoverDispValue = "";
hoverVLabel = "";
let hoverZTitleforPopUp = "";
let hoverEsgRisk = "";

/*==============================================*/
//                 FUNCTIONS
/*==============================================*/

function expandData() {
    console.log("Expand Data");
    $(".align").toggleClass("tg-layer2-on tg-layer2-off")
    toggleExtend();
}

function toggle3d() {
    console.log("Toggle 3D");
    toggleOrtho();
}

function lapTime(message) {
    lastTime = currentTime;
    currentTime = (new Date()).getTime();
    deltaTime = currentTime - lastTime;
    console.log(message + ": " + deltaTime / 1000);
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function isiOS() {
    return (
        //Detect iPhone
        (navigator.platform.indexOf("iPhone") != -1) ||
        //Detect iPod
        (navigator.platform.indexOf("iPod") != -1) ||
        //Detect iPad
        (navigator.platform.indexOf("iPad") != -1)
    );
}

function init() {


    console.log("Initialize");

    clock = new THREE.Clock();

    var skin = $("script:last").attr("skin");
    var bgColor = $("script:last").attr("bgColor");

    darkSkin = false;

    bgColor = "transparent";
    cubeBgColor = "0x000000";

    $('body').css('background-color', bgColor);

    if (orthoCamera) {
        tweenInterp.cam = 0;
    } else {
        tweenInterp.cam = 1;
    }

    // Setup Renderer

    var canvas = !!window.CanvasRenderingContext2D;
    var webgl = (function () {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })();

    if (webgl) renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    else if (canvas) renderer = new THREE.CanvasRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById('canvas')
    if (container)
        container.appendChild(renderer.domElement);
    else
        console.warn("canvas container not found");

    renderer.setClearColor(cubeBgColor, 0);
    renderer.clear();

    // Register event listeners

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('dblclick', onDocumentDoubleClick, false);
    document.addEventListener('mousemove', onDocumentMouseMove, true);
    document.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);


    // Set orbit controller
    controls = new THREE.OrbitControls(dolly, renderer.domElement);
    camTween.onUpdate(onUpdate);

    projector = new THREE.Projector();

    scene.add(dataPoints);
    scene.add(referenceCube);
    referenceCube.add(labels);
    scene.add(dolly);
    dolly.add(cameraSpot);
    cameraSpot.add(camera);
    dolly.position = new THREE.Vector3(0, 0, -0.00001);
    camera.position.z = 3;

    // Events from script changes
    $("script:last").change(function () {
        console.log($("script:last").attr("value"));
    });
}


function displayCube() {

    var material = new THREE.LineBasicMaterial({
        color: cubeLnColor
    });
    material.linewidth = cubeLnWidth;

    referenceCube.visible = true;
    referenceCube.position = new THREE.Vector3(0, 0, 0);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(1, -1, 1));
    b_geometry.vertices.push(new THREE.Vector3(1, -1, -1));
    b_geometry.vertices.push(new THREE.Vector3(-1, -1, -1));
    b_geometry.vertices.push(new THREE.Vector3(-1, -1, 1));
    b_geometry.vertices.push(new THREE.Vector3(1, -1, 1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(1, 1, 1));
    b_geometry.vertices.push(new THREE.Vector3(1, 1, -1));
    b_geometry.vertices.push(new THREE.Vector3(-1, 1, -1));
    b_geometry.vertices.push(new THREE.Vector3(-1, 1, 1));
    b_geometry.vertices.push(new THREE.Vector3(1, 1, 1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(1, 1, 1));
    b_geometry.vertices.push(new THREE.Vector3(1, -1, 1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(1, 1, -1));
    b_geometry.vertices.push(new THREE.Vector3(1, -1, -1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(-1, 1, 1));
    b_geometry.vertices.push(new THREE.Vector3(-1, -1, 1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

    var b_geometry = new THREE.Geometry();
    b_geometry.vertices.push(new THREE.Vector3(-1, 1, -1));
    b_geometry.vertices.push(new THREE.Vector3(-1, -1, -1));
    var bottom = new THREE.Line(b_geometry, material);
    referenceCube.add(bottom);

}

function displaySlices() {

    var material = new THREE.LineBasicMaterial({
        color: cubeLnColor
    });
    material.linewidth = sliceLnWidth;

    var sliceGeometry = new THREE.Geometry();
    sliceGeometry.vertices.push(new THREE.Vector3(1, 0, 1));
    sliceGeometry.vertices.push(new THREE.Vector3(1, 0, -1));
    sliceGeometry.vertices.push(new THREE.Vector3(-1, 0, -1));
    sliceGeometry.vertices.push(new THREE.Vector3(-1, 0, 1));
    sliceGeometry.vertices.push(new THREE.Vector3(1, 0, 1));
    var slice = new THREE.Line(sliceGeometry, material);

    if (sliceX != 0) {
        slice.rotation.set(0, 0, Math.PI / 2);
        slice.position.set(2 * sliceX - 1, 0, 0);
        referenceCube.add(slice.clone());
    }

    if (sliceY != 0) {
        slice.rotation.set(0, 0, 0);
        slice.position.set(0, 2 * sliceY - 1, 0);
        referenceCube.add(slice.clone());
    }

    if (sliceZ != 0) {
        slice.rotation.set(Math.PI / 2, 0, 0);
        slice.position.set(0, 0, 2 * sliceZ - 1);
        referenceCube.add(slice.clone());
    }

}

function displayCrossHair() {

    var material = new THREE.LineBasicMaterial({
        color: cubeLnColor
    });
    material.linewidth = crossHairLnWidth;

    // CrossHair

    var xLine = makeStatLine(new THREE.Vector3(-1, crossHair.y, crossHair.z), new THREE.Vector3(1, crossHair.y, crossHair.z), 'x');
    crossHairObject.add(xLine);
    crossHairObject.x = xLine;

    var yLine = makeStatLine(new THREE.Vector3(crossHair.x, -1, crossHair.z), new THREE.Vector3(crossHair.x, 1, crossHair.z), 'y');
    crossHairObject.add(yLine);
    crossHairObject.y = yLine;

    var zLine = makeStatLine(new THREE.Vector3(crossHair.x, crossHair.y, -1), new THREE.Vector3(crossHair.x, crossHair.y, 1), 'z');
    crossHairObject.add(zLine);
    crossHairObject.z = zLine;

    crossHairObject.visible = false;
    scene.add(crossHairObject);

}

function sceneFadeIn() {
    crossHairObject.visible = true;
    referenceCube.visible = true;
}

function setCrossHair(v) {

    try {
        formatedData['config']['modules']['PCA'] != null
    } catch (e) {
        try {
            formatedData['config']['modules']['TSNE'] != null
        } catch (e) {
            crossHairObject.x.position.set(0, v.y, v.z);
            crossHairObject.y.position.set(v.x, 0, v.z);
            crossHairObject.z.position.set(v.x, v.y, 0);

            if (v == THREE.Vector3(1, 1, 1)) {
                crossHairObject.scale = 0.0001;
            } else {
                crossHairObject.scale = 1;
            }
        }
    }
}

var onUpdate = function () {

    var cam = this.cam;

    var dollyInterp = ((0.5 - 0.05) * cam + 0.025);
    var distance = (2 - dollyInterp) / dollyInterp;
    camera.position.z = distance;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.fov = 75 * 2 / (distance - 1.05);
    camera.updateProjectionMatrix();

}

var onUpdateSnap = function () {
    moveCamTo(this.theta, this.phi);
}

var onUpdateExtend = function () {

    for (var i = 0; i < dataPoints.children.length; i++) {

        dataPoint = dataPoints.children[i];

        linearPos = {};

        linearPos.x = (formatedData['data'][i]['x_v'] - formatedData['config']['x']['min']) / (formatedData['config']['x']['max'] - formatedData['config']['x']['min']);
        linearPos.y = (formatedData['data'][i]['y_v'] - formatedData['config']['y']['min']) / (formatedData['config']['y']['max'] - formatedData['config']['y']['min']);
        linearPos.z = (formatedData['data'][i]['z_v'] - formatedData['config']['z']['min']) / (formatedData['config']['z']['max'] - formatedData['config']['z']['min']);

        extendPos = {};

        extendPos.x = formatedData['data'][i]['x'];
        extendPos.y = formatedData['data'][i]['y'];
        extendPos.z = formatedData['data'][i]['z'];

        dataPoint.position.x = (linearPos.x * this.extend + extendPos.x * (1 - this.extend)) * 2 - 1;
        dataPoint.position.y = (linearPos.y * this.extend + extendPos.y * (1 - this.extend)) * 2 - 1;
        dataPoint.position.z = (linearPos.z * this.extend + extendPos.z * (1 - this.extend)) * 2 - 1;

    }
}

var onUpdateCameraSpotReturn = function () {
    var y = this.cameraSpotY;
    cameraSpot.rotation.y = y;
}

camTween.onUpdate(onUpdate);

function render() {
    update();

    if (demo != "False") {

        if (demoStart < 6.5 && demoStart > 5.5) {
            toggleOrtho();
            demoStart = 5.4;
        }

        if (demoStart < 3 && demoStart > 2) {
            toggleOrtho();
            demoStart = 1.9;
        }

        if (demoStart > 0) {
            demoStart -= clock.getDelta();
        } else {
            demoStart = -5;
            cameraSpot.rotation.y += 0.002 * Math.sin(0.5 * (clock.getElapsedTime() - 1.75));
            tweenInterp.cameraSpotY = cameraSpot.rotation.y;
        }
    }
    // step += 0.02;

    requestAnimationFrame(render);
    renderer.autoClear = true;
    renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(scene2, camera);
};

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseDown(event) {

    snapTween.stop();
    lastEvent = "click";

    if (demo != "False") {
        cameraSpotReturn = new TWEEN.Tween(tweenInterp).to({
            cameraSpotY: 0,
        }, 500);
        cameraSpotReturn.easing(TWEEN.Easing.Quintic.Out);
        cameraSpotReturn.onUpdate(onUpdateCameraSpotReturn);
        cameraSpotReturn.start();
        demo = "False"
    }


    switch (event.button) {
        case 0: // left 
            button = "left"
            break;

        case 2: // right
            button = "right"
            break;
    }
}

function onDocumentDoubleClick(event) {
    snapTween.stop();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1.00;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.00;

    checkSelection();

}

function onDocumentMouseMove(event) {

    if (lastEvent == "click") {
        lastEvent = "drag";
    }

    ec.x = event.clientX;
    ec.y = event.clientY;

    mouse.x = (ec.x / window.innerWidth) * 2 - 1.00;
    mouse.y = -(ec.y / window.innerHeight) * 2 + 1.00;

}


function moveCamTo(theta, phi) {

    var mag = -0.001;

    var position = new THREE.Vector3(
        mag * Math.cos(phi * Math.PI / 180) * Math.sin(theta * Math.PI / 180), -mag * Math.sin(phi * Math.PI / 180),
        mag * Math.cos(phi * Math.PI / 180) * Math.cos(theta * Math.PI / 180)
    );

    dolly.position = position;


}

function snap() {

    var camPos = new THREE.Vector3;
    camPos.setFromMatrixPosition(camera.matrixWorld);

    var theta = Math.atan2(camPos.x, camPos.z) * 180 / Math.PI;
    var phi = Math.atan2(Math.sqrt(camPos.x * camPos.x + camPos.z * camPos.z), camPos.y) * 180 / Math.PI - 90;
    thetaGoal = 90 * Math.floor((44 + theta) / 90);
    phiGoal = 89.999 * Math.floor((44 + phi) / 90);

    tweenInterp.phi = phi;
    tweenInterp.theta = theta;

    snapTween = new TWEEN.Tween(tweenInterp).to({
        theta: thetaGoal,
        phi: phiGoal
    }, 500);
    snapTween.easing(TWEEN.Easing.Quintic.Out);
    snapTween.onUpdate(onUpdateSnap);
    snapTween.start();

}

function onMouseUp(event) {
    lastEvent = "mouseUp";
    button = "none";
    isMoving = false;

    if (orthoCamera) {

        snap();
    }
}

function onKeyDown(event) {

    switch (event.keyCode) {

        case keys.G:

            showGuides = !showGuides;

            break;

        case 27: // escape key
            exitHighLight = true;

            // case keys.S:

            //  darkSkin = !darkSkin;

            //  if(darkSkin) {
            //      cubeBgColor = 0x111111;
            //  } else {
            //      cubeBgColor = 0xffffff;
            //  }

            //  renderer.setClearColor(cubeBgColor);
            //  renderer.clear();


            break;

        case keys.D:
            toggleOrtho();
            break;

        case keys.X:
            toggleExtend();
            break;
    }

}

function toggleOrtho() {

    var toInterp;

    if (orthoCamera) {
        tweenInterp.cam = 0;
        toInterp = 1;
        orthoCamera = false;
    } else {
        tweenInterp.cam = 1;
        toInterp = 0;
        orthoCamera = true;
        snap();
    }

    camTween = new TWEEN.Tween(tweenInterp).to({
        cam: toInterp
    }, 500);
    camTween.easing(TWEEN.Easing.Bounce.Out);
    camTween.onUpdate(onUpdate);
    camTween.start();
}

function toggleExtend() {

    console.log(extend);

    var toInterp;

    if (extend) {
        tweenInterp.extend = 0;
        toInterp = 1;
        extend = false;
    } else {
        tweenInterp.extend = 1;
        toInterp = 0;
        extend = true;
    }

    extendTween = new TWEEN.Tween(tweenInterp).to({
        extend: toInterp
    }, 500);

    extendTween.easing(TWEEN.Easing.Quadratic.InOut);
    extendTween.onUpdate(onUpdateExtend);
    extendTween.start();
}

function checkSelection() {

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    var camPos = new THREE.Vector3;
    camPos.setFromMatrixPosition(camera.matrixWorld);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camPos, vector.sub(camPos).normalize());

    var intersects = ray.intersectObjects(targetList);

    if (intersects.length > 0) { }
}

function updateDetails() {

    if (mouse.x >= 0) {
        xLabel = ec.x - 30 - text.clientWidth;
    } else {
        xLabel = ec.x + 30;
    }

    if (mouse.y >= 0) {
        yLabel = ec.y + 30;
    } else {
        yLabel = ec.y - 30 - text.clientHeight;
    }

    text.style.left = xLabel + 'px';
    text.style.top = yLabel + 'px';


    text.style.visibility = "visible";

}

function checkHighlight() {

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    var camPos = new THREE.Vector3;
    camPos.setFromMatrixPosition(camera.matrixWorld);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camPos, vector.sub(camPos).normalize());

    var intersects = ray.intersectObjects(targetList);

    if ((intersects.length > 0) && (lastEvent != "drag")) { // case if mouse is not currently over an object

        INTERSECTED = intersects[0];

        if (LASTINTERSECTED != INTERSECTED) {
            if (LASTINTERSECTED)
                LASTINTERSECTED.object.material.opacity = 0.75;
            LASTINTERSECTED = INTERSECTED;
        }

        INTERSECTED.object.material.opacity = 1;

        //Get titles and values

        hoverID = intersects[0].object.id;
        hoverName = intersects[0].object.displayName;
        hoverXTitle = formatedData['config']['x']['title'];
        hoverYTitle = formatedData['config']['y']['title'];
        hoverZTitle = formatedData['config']['z']['title'];
        hoverCTitle = formatedData['config']['c']['title'];
        hoverVTitle = formatedData['config']['v']['title'];
        hoverXValue = intersects[0].object.x_f * 100;
        hoverYValue = intersects[0].object.y_f;
        hoverZValue = intersects[0].object.z_f;
        hoverCValue = intersects[0].object.c_f;
        hoverVValue = intersects[0].object.v_f;
        hoverIndex = intersects[0].object.index;
        hoverZTitleforPopUp = "ESG Risk";
        hoverEsgRisk = intersects[0].object.esg_risk;
        hoverID = intersects[0].object.id;

        //  text.innerHTML = '<span onclick="return false;">' + hoverName + ' (' + hoverID + ')<br></span>';


        // after a right-click, show hover box and floating vector
        //        if ((lastEvent == "click" && button == "right") || isiOS()) {

        if (isiOS()) {
            text.innerHTML = '<span onclick="return false;">' + hoverName + ' (' + hoverID + ')<br></span>';

            //in iOS, include both ID and name if different
            if (hoverName != hoverID) {
                text.innerHTML += '<span onclick="return false;">' + hoverName + ' (' + hoverID + ')<br></span>';
            }
            // otherwise start with name
        } else {
            text.innerHTML = '<span onclick="return false;">' + hoverName + ' (' + hoverID + ')<br></span>';
        }

        // add parameter values

        //first, determine letter grade for ssrating (color of sphere) 
        switch (true) {
            case (hoverCValue < 1.5):
                theLet = 'A';
                break;
            case (hoverCValue <= 2.5):
                theLet = 'B';
                break;
            case (hoverCValue <= 3.5):
                theLet = 'C';
                break;
            case (hoverCValue <= 4.5):
                theLet = 'D';
                break;
            default:
                theLet = 'F';
                break;
        }

        //now, determine letter grade for esg_risk
        switch (true) {
            case (hoverEsgRisk < 1.5):
                theEsgLet = 'A';
                break;
            case (hoverEsgRisk <= 2.5):
                theEsgLet = 'B';
                break;
            case (hoverEsgRisk <= 3.5):
                theEsgLet = 'C';
                break;
            case (hoverEsgRisk <= 4.5):
                theEsgLet = 'D';
                break;
            default:
                theEsgLet = 'F';
                break;
        }

        //first, determine letter grade
        switch (true) {
            case (hoverVValue >= 1000000):
                hoverDispValue = addCommas((hoverVValue / 1000000).toFixed(0));
                hoverVLabel = ' Trillion';
                break;
            case (hoverVValue >= 1000):
                hoverDispValue = addCommas((hoverVValue / 1000).toFixed(0));
                hoverVLabel = ' Billion';
                break;
            default:
                hoverDispValue = addCommas((hoverVValue / 1).toFixed(0));
                hoverVLabel = ' Million';
                break;
        }

        // set egClass (regular or negative)
        if (hoverXValue < 0) {
            egClass = 'details_text_negative';
            hoverXValue = '(' + (-hoverXValue).toFixed(1) + ' %)';
            egFloatClass = 'neg';
        } else {
            egClass = 'details_text';
            hoverXValue = hoverXValue.toFixed(1) + ' %';
            egFloatClass = 'pos';
        }
        text.innerHTML += '</br>' +
            '<div class="color' + theLet + '">' +
            hoverCTitle + ' = ' + theLet + '</div>' +
           /* '<span class="details_text">' +
            hoverXTitle + ' = </span><span class="' + egClass + '">' + theLet + '</span><br>' +*/ '<span class="details_text">' +
            hoverYTitle + ' = ' + hoverYValue + ' X</span><br>' +
            '<span class="details_text">' + '<div class="color' + theEsgLet + '">' +
            hoverZTitleforPopUp + ' = ' + theEsgLet + '</div></span><br>' +
            '<span class="details_text">' +
            hoverVTitle + ' = $' + hoverDispValue + hoverVLabel + '</span>';

        if ((lastEvent == "click") || isiOS()) {

            //now update/show floating vector for this symbol

            if ($('#lastPicked').html().substr(0, hoverID.length) != hoverID) {
                // show it
                $('#tooltip_container').html($('#floating_vector').html());

                if (window.parent.parent.document.getElementById("tooltip_container")) {
                    var floatingVecotrHTML = $('#floating_vector').html();
                    $(window.parent.parent.document.getElementById("tooltip_container")).html(floatingVecotrHTML);

                    $(window.parent.parent.document.getElementById('vecSym')).html(`<a class="vector-drilldown-anchor" href="/Company/Details/${hoverID}" target="_top">` + hoverName.substr(0, 24) + "&nbsp;<span class='color'" + theLet + '>&nbsp;(' + hoverID + ')&nbsp;</span></a>');
                    $(window.parent.parent.document.getElementById('vecRT')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + hoverCTitle.substr(0.24) + '= ' + theLet + '</p>')
                    $(window.parent.parent.document.getElementById('vecPE')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + hoverYTitle.substr(0.24) + '= ' + hoverYValue + ' X' + '</p>')
                    $(window.parent.parent.document.getElementById('vecEG')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + hoverZTitle.substr(0.24) + '= ' + '(' + hoverZValue + ') %' + '</p>')
                    $(window.parent.parent.document.getElementById('vecTR')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + hoverXTitle.substr(0.24) + '= ' + hoverXValue + '</p>')
                    $(window.parent.parent.document.getElementById('vecESG')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + "ESG Risk = " + theEsgLet + '</p>')
                    $(window.parent.parent.document.getElementById('vecMCap')).html('<p class="vector-drilldown-paragraph href="/Company/Details/${hoverID}" target="_top">' + hoverVTitle.substr(0.24) + '=' + hoverDispValue + hoverVLabel + '</p>')

                } else {
                    console.log("tooltip container not found.");
                }
                //$('#vecSym').html(hoverName.substr(0,24) + ' (' + hoverID + ' $' + '000.000' + ')&nbsp;&nbsp;<span class="color'+theLet+'">&nbsp;Ainstein Rating=' + theLet+'&nbsp;</span>');

                //KJM Changed this block per Suzanne call 1/25/2018
                //KJM --also updated .col3 in ../ratings/css/ratings.css


                //$('#vecSym').html(hoverName.substr(0,24) + ' (' + hoverID + ')&nbsp;&nbsp;<span class="color'+theLet+'">&nbsp;Ainstein Rating=' + theLet+'&nbsp;</span>');
                //$('#vecPE').html('P/E Multiple = ' + hoverYValue + ' X');
                //$('#vecEG').html('Earnings Growth = <span class="' + egFloatClass + '">' + hoverXValue + '</span>');
                //$('#vecMCap').html('Market Cap = $' + addCommas((hoverVValue/1000000).toFixed(0)) + ' Million');

                //$('#vector').prop('src', '../vectfloat/vector.html?sym=' + hoverID + '&');
                //KJM 2021-06-15 disabling the old version at 40.114.118.141 and using local version
                //$('#vector').prop('src', 'http://40.114.118.141/ratings/vector.html?sym=' + hoverID + '&');
                if (inIframe()) {
                    $('#vector').hide();
                } else {
                    $('#vecSym').html(`<a class="vector-drilldown-anchor" href="/Company/Details/${hoverID}" target="_top">` + hoverName.substr(0, 24) + "&nbsp;<span class='color'" + theLet + '>&nbsp;(' + hoverID + ')&nbsp;</span></a>');
                }
                $('#vector').prop('src', '/Portfolio/Vector/' + hoverID);

                // next row calls loadRatings to grab and display vector.
                // better solution, once API working again
                //showVector(hoverID);
                //$('#tooltip_container').css({ 'display': 'block', 'opacity': 0 }).animate({ opacity: 1 }, 250);

                $('#lastPicked').html(hoverID);
            }

            /* KJM - use this to include other custom elements in the hover box
             * KJM - for now, remmed out, because we're setting the inner HTML to the tooltip...
             
                        customElements = formatedData['config']['custom'];
            
                        if (customElements != null) {
                            for (customIndex = 0; customIndex < customElements.length; customIndex++) {
                                ce = customElements[customIndex];
                                if (ce['type'] == 'url') {
                                    text.innerHTML += '<span class="details_text">' + formatedData['data'][hoverIndex]['custom'][ce['tag']] + '</br></span>'
                                } else {
                                    text.innerHTML += '<span class="details_text">' + ce['title'] + ': ' + formatedData['data'][hoverIndex]['custom'][ce['tag']] + '<br></span>'
                                }
                            }
                        }
            */
        }

        updateDetails();

        if (showGuides) {
            setCrossHair(INTERSECTED.object.position);
        }

    } else if ((button != "right")) // there are no intersections
    {

        setCrossHair(new THREE.Vector3(1, 1, 1));

        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED) {

            INTERSECTED.object.material.opacity = 0.75;
            //INTERSECTED.object.geometry.colorsNeedUpdate=true;
        }
        INTERSECTED = null;
        button == "none";

    }

    if (intersects.length === 0 && lastEvent === "mouseUp") {

        if (text) {
            // hide text
            text.style.visibility = "hidden";
            // hide vector
            // $('#tooltip_container').animate({opacity:0},250, function(){
            // $('#tooltip_container').css('display','none')
            // });
        }
    }

}


function update() {

    controls.update();
    try {
        TWEEN.update();
    } catch (err) {
        console.log("exception: " + err.message);
    }
    checkHighlight();

}

function setTitles() {
    // AxisTitles

    // Make X front title texture

    scene2.remove(axisTitles);
    axisTitles = new THREE.Object3D();

    titleTexture = makeAxisText(TitleX, fromX, toX);
    var materialAxisText = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
    });

    materialAxisText.transparent = true;

    var titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.25),
        materialAxisText
    );

    titleMesh.position.set(0, -1.1, 1);
    titleMesh.rotation.set(0, 0, 0);

    titleMeshTop = titleMesh.clone();

    titleMeshTop.position.set(0, 1, 1.1);
    titleMeshTop.rotation.set(-Math.PI / 2, 0, 0);

    axisTitles.add(titleMesh);
    axisTitles.add(titleMeshTop);

    // Make X back title texture

    titleTexture = makeAxisText(TitleX, toX, fromX);

    var materialAxisText = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
    });

    materialAxisText.transparent = true;

    var titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.25),
        materialAxisText
    );

    titleMesh.position.set(0, -1.1, -1);
    titleMesh.rotation.set(0, Math.PI, 0);

    titleMeshTop = titleMesh.clone();

    titleMeshTop.position.set(0, 1, -1.1);
    titleMeshTop.rotation.set(Math.PI / 2, Math.PI, 0);

    axisTitles.add(titleMesh);
    axisTitles.add(titleMeshTop);

    // Make Z front title texture

    titleTexture = makeAxisText(TitleZ, fromZ, toZ);

    var materialAxisText = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
    });

    materialAxisText.transparent = true;

    var titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.25),
        materialAxisText
    );

    titleMesh.position.set(-1, -1.1, 0);
    titleMesh.rotation.set(0, -Math.PI / 2, 0);

    titleMeshTop = titleMesh.clone();

    titleMeshTop.position.set(-1.1, 1, 0);
    titleMeshTop.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2);

    axisTitles.add(titleMesh);
    axisTitles.add(titleMeshTop);

    // Make Z back title texture

    titleTexture = makeAxisText(TitleZ, toZ, fromZ);

    var materialAxisText = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
    });

    materialAxisText.transparent = true;

    var titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.25),
        materialAxisText
    );

    titleMesh.position.set(1, -1.1, 0);
    titleMesh.rotation.set(0, Math.PI / 2, 0);

    titleMeshTop = titleMesh.clone();

    titleMeshTop.position.set(1.1, 1, 0);
    titleMeshTop.rotation.set(Math.PI / 2, Math.PI, -Math.PI / 2);

    axisTitles.add(titleMesh);
    axisTitles.add(titleMeshTop);


    // Make Y titles texture

    titleTexture = makeAxisText(TitleY, fromY, toY);

    var materialAxisText = new THREE.MeshBasicMaterial({
        map: titleTexture,
        transparent: true,
    });

    materialAxisText.transparent = true;

    var titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.25),
        materialAxisText
    );

    titleMesh.position.set(-1.1, 0, 1);
    titleMesh.rotation.set(0, 0, Math.PI / 2);
    axisTitles.add(titleMesh);

    titleMesh1 = titleMesh.clone();
    titleMesh1.position.set(-1, 0, -1.1);
    titleMesh1.rotation.set(0, -Math.PI / 2, Math.PI / 2);
    axisTitles.add(titleMesh1);

    titleMesh2 = titleMesh.clone();
    titleMesh2.position.set(1, 0, 1.1);
    titleMesh2.rotation.set(0, Math.PI / 2, Math.PI / 2);
    axisTitles.add(titleMesh2);

    titleMesh2 = titleMesh.clone();
    titleMesh2.position.set(1.1, 0, -1);
    titleMesh2.rotation.set(0, Math.PI, Math.PI / 2);
    axisTitles.add(titleMesh2);

    scene2.add(axisTitles);
}

function lerpColor(c1, c2, val) {

    var R1 = hexToR(c1);
    var G1 = hexToG(c1);
    var B1 = hexToB(c1);

    var R2 = hexToR(c2);
    var G2 = hexToG(c2);
    var B2 = hexToB(c2);

    var R = (1 - val) * R1 + val * R2;
    var G = (1 - val) * G1 + val * G2;
    var B = (1 - val) * B1 + val * B2;

    var rgb = B | (G << 8) | (R << 16) | (1 << 24);

    return '#' + rgb.toString(16).substring(1, 7);
}


function hexToR(h) {
    return parseInt((cutHex(h)).substring(0, 2), 16)
}

function hexToG(h) {
    return parseInt((cutHex(h)).substring(2, 4), 16)
}

function hexToB(h) {
    return parseInt((cutHex(h)).substring(4, 6), 16)
}

function cutHex(h) {
    if (typeof h != 'undefined') {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    } else {
        return "888888";
    }

}

function makeAxisText(displayText, rVal, lVal) {

    var canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 200;
    var context = canvas.getContext('2d');
    context.globalAlpha = 1;

    context.fillStyle = darkSkin ? "#AAAAAA" : "#444444";

    //context.font = '80px "helvetica"'; // KJM change per Jeanine 3/22/18
    context.font = '72px "helvetica"';
    context.textAlign = "center";
    context.textBaseline = "middle"
    context.fillText(displayText, 800, 100, 1200);

    //context.font = '80px "helvetica"'; // KJM change per Jeanine 3/22/18
    context.font = '66px "helvetica"';
    context.textAlign = "left";
    context.fillText(rVal, 30, 100, 300);

    //context.font = '80px "helvetica"'; // KJM change per Jeanine 3/22/18
    context.font = '66px "helvetica"';
    context.textAlign = "right";
    context.fillText(lVal, 1600 - 30, 100, 300);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;

}

function makeLabelTexture(id) {

    var canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    var context = canvas.getContext('2d');
    context.globalAlpha = 1;

    if (darkSkin) {
        context.fillStyle = "#bbbbbb";
    } else {
        context.fillStyle = "#444444";
    }

    context.font = "40px helvetica";
    context.textAlign = "center";
    context.textBaseline = "top"
    context.fillText(id, 200, 50, 600);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;

}

function makeLabelSprite(id, v) {

    texture = makeLabelTexture(id);

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        transparent: true
    });

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.5 * v, 3.5 * v, 3.5 * v);
    sprite.position.set(0, 0, 0);
    return sprite;
}

function makeCornerTagTexture(id) {

    var canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    var context = canvas.getContext('2d');
    context.globalAlpha = 1;

    if (darkSkin) {
        context.fillStyle = "#bbbbbb";
    } else {
        context.fillStyle = "#444444";
    }

    context.font = "80px helvetica";
    context.textAlign = "center";
    context.textBaseline = "top"
    context.fillText(id, 200, 100);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;

}

function makeCornerTag(tag) {

    texture = makeCornerTagTexture(tag);

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        transparent: true
    });

    v = 0.3

    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(v, v, v);
    sprite.position.set(0, 0, 0);
    return sprite;
}

function loadDataLocally() {

    var hl = highlightId;
    var hlTitle = "";

    jsonToData(json, hl);

    formatedData = data;

    lapTime("Loaded Data");

    // Flip data and reference Cube

    flip = "None";

    if (config.hasOwnProperty('flip')) {
        flip = formatedData['config']['flip'];
        crossHairObject.scale.set(flip[0], flip[1], flip[2]);
        referenceCube.scale.set(flip[0], flip[1], flip[2]);
        dataPoints.scale.set(flip[0], flip[1], flip[2]);
    }

    // Iterate rows:
    for (var i = 0; i < formatedData.data.length; i++) {

        col = formatedData['data'][i]['c'];

        // Cube Geometry
        var geometry = new THREE.SphereGeometry(0.7071, 32, 32);
        var material = new THREE.MeshBasicMaterial({
            color: col
        });

        dataPoint = new THREE.Mesh(geometry, material);

        dataPoint.id = formatedData['data'][i]['id'];
        dataPoint.displayName = formatedData['data'][i]['name'];
        dataPoint.name = "cube";

        if (extend) {
            dataPoint.x = formatedData['data'][i]['x'] * 2 - 1;
            dataPoint.y = formatedData['data'][i]['y'] * 2 - 1;
            dataPoint.z = formatedData['data'][i]['z'] * 2 - 1;
        } else {
            dataPoint.x = (formatedData['data'][i]['x_v'] - formatedData['config']['x']['min']) / (formatedData['config']['x']['max'] - formatedData['config']['x']['min']) * 2 - 1;
            dataPoint.y = (formatedData['data'][i]['y_v'] - formatedData['config']['y']['min']) / (formatedData['config']['y']['max'] - formatedData['config']['y']['min']) * 2 - 1;
            dataPoint.z = (formatedData['data'][i]['z_v'] - formatedData['config']['z']['min']) / (formatedData['config']['z']['max'] - formatedData['config']['z']['min']) * 2 - 1;
        }

        dataPoint.size = formatedData['data'][i]['v'] * 10;
        dataPoint.col = col;

        dataPoint.x_f = formatedData['data'][i]['x_f'];
        dataPoint.y_f = formatedData['data'][i]['y_f'];
        dataPoint.z_f = formatedData['data'][i]['z_f'];
        dataPoint.c_f = formatedData['data'][i]['c_f'];
        dataPoint.v_f = formatedData['data'][i]['v_f'];
        dataPoint.esg_risk = formatedData['data'][i]['esg_risk'];
        dataPoint.index = i;

        material.transparent = true;
        material.opacity = 0.75;
        outlineColored = true;

        dataPoint.position = new THREE.Vector3(dataPoint.x, dataPoint.y, dataPoint.z);
        dataPoint.scale.set(dataPoint.size, dataPoint.size, dataPoint.size);

        col = "#20a3b1";
        col = "#000000";

        var outlineMaterial2 = new THREE.MeshBasicMaterial({
            color: col,
            side: THREE.BackSide
        });

        outlineMaterial2.transparent = true;

        var outlineMesh2 = new THREE.Mesh(geometry, outlineMaterial2);

        outlineMesh2.scale.multiplyScalar(1.15);

        if (dataPoint.id == hl) {
            dataPoint.add(outlineMesh2);
            dataPoint.outline = outlineMesh2;
            var label = makeLabelSprite(hlTitle, dataPoint.size);
            label.position = new THREE.Vector3(dataPoint.x, dataPoint.y, dataPoint.z);
            labels.add(label);
        }

        dataPoints.add(dataPoint);
        targetList.push(dataPoint);
    }

    lapTime("Rendered Data");

    // Loaded, activate toggles / tweens

    camTween.start();

    TitleX = formatedData['config']['x']['title'];
    TitleY = formatedData['config']['y']['title'];
    TitleZ = formatedData['config']['z']['title'];

    if (flip[0] != -1) {
        fromX = formatedData['config']['x']['min_s'];
        toX = formatedData['config']['x']['max_s'];
    } else {
        fromX = formatedData['config']['x']['max_s'];
        toX = formatedData['config']['x']['min_s'];
    }

    if (flip[1] != -1) {
        fromY = formatedData['config']['y']['min_s'];
        toY = formatedData['config']['y']['max_s'];
    } else {
        fromY = formatedData['config']['y']['max_s'];
        toY = formatedData['config']['y']['min_s'];
    }

    if (flip[2] != -1) {
        fromZ = formatedData['config']['z']['min_s'];
        toZ = formatedData['config']['z']['max_s'];
    } else {
        fromZ = formatedData['config']['z']['max_s'];
        toZ = formatedData['config']['z']['min_s'];
    }


    sliceX = formatedData['config']['x']['zero'];
    sliceY = formatedData['config']['y']['zero'];
    sliceZ = formatedData['config']['z']['zero'];

    // Set corner tags

    if (formatedData['config'].hasOwnProperty('cornerTags')) {

        console.log("Has Corner Tags");

        cTag000 = formatedData['config']['cornerTags']['000']
        cTag001 = formatedData['config']['cornerTags']['001']
        cTag010 = formatedData['config']['cornerTags']['010']
        cTag011 = formatedData['config']['cornerTags']['011']
        cTag100 = formatedData['config']['cornerTags']['100']
        cTag101 = formatedData['config']['cornerTags']['101']
        cTag110 = formatedData['config']['cornerTags']['110']
        cTag111 = formatedData['config']['cornerTags']['111']

        // Corner Tags (cTag) per GLAC

        ctOffset = 1.05

        if (cTag000 != "") {

            var label = makeCornerTag(cTag000);
            label.position = new THREE.Vector3(-ctOffset, -ctOffset, -ctOffset);
            labels.add(label);
        }

        if (cTag001 != "") {
            var label = makeCornerTag(cTag001);
            label.position = new THREE.Vector3(-ctOffset, -ctOffset, ctOffset);
            labels.add(label);
        }

        if (cTag010 != "") {
            var label = makeCornerTag(cTag010);
            label.position = new THREE.Vector3(-ctOffset, ctOffset, -ctOffset);
            labels.add(label);
        }

        if (cTag011 != "") {
            var label = makeCornerTag(cTag011);
            label.position = new THREE.Vector3(-ctOffset, ctOffset, ctOffset);
            labels.add(label);
        }

        if (cTag100 != "") {
            var label = makeCornerTag(cTag100);
            label.position = new THREE.Vector3(ctOffset, -ctOffset, -ctOffset);
            labels.add(label);
        }

        if (cTag101 != "") {
            var label = makeCornerTag(cTag101);
            label.position = new THREE.Vector3(ctOffset, -ctOffset, ctOffset);
            labels.add(label);
        }

        if (cTag110 != "") {
            var label = makeCornerTag(cTag110);
            label.position = new THREE.Vector3(ctOffset, ctOffset, -ctOffset);
            labels.add(label);
        }

        if (cTag111 != "") {
            var label = makeCornerTag(cTag111);
            label.position = new THREE.Vector3(ctOffset, ctOffset, ctOffset);
            labels.add(label);
        }
    }

    if (config.hasOwnProperty('modules')) {
        if (config.modules.hasOwnProperty('PCA') ||
            config.modules.hasOwnProperty('TSNE')) { } else {
            displayCube();
            displayCrossHair();
            // displaySlices();
            setTitles();
        }

    } else {
        displayCube();
        displayCrossHair();
        // displaySlices();
        setTitles();
    }

    sceneFadeIn();
    render();
}

function normalizeValue(axis, value) {

    var array = [];
    var pos = [];

    for (var i = 0; i < formatedData['data'].length; i++) {
        array.push(formatedData['data'][i][axis + "_v"])
        pos.push(formatedData['data'][i][axis])
    }

    array.sort(d3.ascending);
    pos.sort(d3.ascending);

    var arrayLength = array.length;
    var valuePos = 0;

    for (var i = 1; i < arrayLength; i++) {
        if ((array[i - 1] <= value) && (array[i] > value)) {

            var factor = (value - array[i - 1]) / (array[i] - array[i - 1]);
            valuePos = pos[i - 1] + factor * (pos[i] - pos[i - 1]);
        }
    }
    return valuePos;
}

function makeStatLine(start, end, axis) {

    var output = new THREE.Object3D;

    var array = [];

    for (var i = 0; i < formatedData['data'].length; i++) {
        array.push(formatedData['data'][i][axis + "_v"])
    }

    array.sort(d3.ascending);

    var percentile1 = normalizeValue(axis, d3.quantile(array, 0.25));
    var mean = normalizeValue(axis, d3.quantile(array, 0.50));
    var percentile3 = normalizeValue(axis, d3.quantile(array, 0.75));

    var redMat = new THREE.LineDashedMaterial({
        color: cubeLnColor
    });
    redMat.dashSize = 0.02;
    redMat.gapSize = 0.02;

    var greenMat = new THREE.LineBasicMaterial({
        color: cubeLnColor
    });

    redMat.linewidth = 1;
    greenMat.linewidth = cubeLnWidth;

    P1 = start.toArray();
    P2 = start.toArray();
    P4 = end.toArray();
    P3 = end.toArray();

    PM = start.toArray();

    for (var i = 0; i < P2.length; i++) {
        P2[i] = P1[i] * (1 - percentile1) + P4[i] * percentile1;
    }

    for (var i = 0; i < P3.length; i++) {
        P3[i] = P1[i] * (1 - percentile3) + P4[i] * percentile3;
    }

    for (var i = 0; i < P3.length; i++) {
        PM[i] = P1[i] * (1 - mean) + P4[i] * mean;
    }

    V1 = new THREE.Vector3(P1[0], P1[1], P1[2]);
    V2 = new THREE.Vector3(P2[0], P2[1], P2[2]);
    V3 = new THREE.Vector3(P3[0], P3[1], P3[2]);
    V4 = new THREE.Vector3(P4[0], P4[1], P4[2]);

    var line = new THREE.Geometry();
    line.vertices.push(V1);
    line.vertices.push(V2);
    line.computeLineDistances();
    var lineObject = new THREE.Line(line, redMat);
    output.add(lineObject);

    var line = new THREE.Geometry();
    line.vertices.push(V2);
    line.vertices.push(V3);
    var lineObject = new THREE.Line(line, greenMat);
    output.add(lineObject);

    var line = new THREE.Geometry();
    line.vertices.push(V3);
    line.vertices.push(V4);
    line.computeLineDistances();
    var lineObject = new THREE.Line(line, redMat);
    output.add(lineObject);

    // average block

    var avgMaterial = new THREE.MeshBasicMaterial({
        color: cubeLnColor
    });
    var avgGeometry = new THREE.BoxGeometry(0.025, 0.025, 0.025);
    var avgCube = new THREE.Mesh(avgGeometry, avgMaterial);
    avgCube.position.set(PM[0], PM[1], PM[2]);
    output.add(avgCube)

    return output;
}

