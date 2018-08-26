// main.js
// authors: Andrew Pittman, Vlad Sliusar, Zheng Li

// Corruption and Governance map of Africa
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")
const tooltip = d3.select(".main-tooltip")
const dataSlider = [1996,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016]
const worldCupYears = [1998,2002,2006,2010,2014]
const widthBody = parseInt(body.style("width"))
const width = parseInt(container.style("width")) - 30
const height = width / 2.05

var moving = false;
var currentValue = 0;
var targetValue = width;

var playButton = d3.select("#play-button");

var x = d3.scaleLinear()
    .domain([1996, 2016])
    .range([0, 800])
    .clamp(true);

const projection = d3.geoNaturalEarth1() // projection used for the mercator projection
    .center([10, -4])
    .scale(160)

const pathGenerator = d3.geoPath()
    .projection(projection)

var responsivefyInd = 0
//responsive map
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"))
        svg.attr("width", targetWidth)
        svg.attr("height", Math.round(targetWidth / aspect))

        // resize toggles after initial load
        if (responsivefyInd > 3) {
            console.log($(window).width())
            if ($(window).width() < 970) {
                $("[data-toggle='toggle']").bootstrapToggle('destroy')
                $("[data-toggle='toggle']").bootstrapToggle({size: "mini"})
            } else if ( ($(window).width() > 970) && ($(window).width() < 1050) ) {
                $("[data-toggle='toggle']").bootstrapToggle('destroy')
                $("[data-toggle='toggle']").bootstrapToggle({size: "small"})
            } else {
                // toggleInputs.attr("data-height", "50")
                $("[data-toggle='toggle']").bootstrapToggle('destroy')
                $("[data-toggle='toggle']").bootstrapToggle({size: "normal"})
            }
        }
        responsivefyInd += 1
    }
}

//create new svg container for the map
var svg = d3.select("#Map")
    .append("div")
    .append("svg")
    .attr("width", 960)
    .attr("height", 500)
    .call(responsivefy);

const countriesG = svg.append('g')
    //.attr('class', 'countries')

let giSelection = "gi1"
let piSelection = "pi2"
let yearSelection = "1996"
let giCurrent = giSelection + "_" + yearSelection
let piCurrent = piSelection + "_" + yearSelection

// Handle data initialization of governance indicators
const govAttributes = [ {"indicator": "gi1",
                        "name": "Voice and Accountability",
                        "infoCardText": "Reflects perceptions of the extent to which a country's citizens are able to participate in selecting their government, as well as freedom of expression, freedom of association, and a free media. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"},
                    {"indicator": "gi2",
                        "name": "Political Stability and No Violence/Terrorism",
                        "infoCardText": "Political Stability and Absence of Violence/Terrorism measures perceptions of the likelihood of political instability and/or politically-motivated violence, including terrorism. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"},
                    {"indicator": "gi3",
                        "name": "Government Effectiveness",
                        "infoCardText": "Reflects perceptions of the quality of public services, the quality of the civil service and the degree of its independence from political pressures, the quality of policy formulation and implementation, and the credibility of the government's commitment to such policies. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"},
                    {"indicator": "gi4",
                        "name": "Regulatory Quality",
                        "infoCardText": "Reflects perceptions of the ability of the government to formulate and implement sound policies and regulations that permit and promote private sector development. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"},
                    {"indicator": "gi5",
                        "name": "Rule of Law",
                        "infoCardText": "Reflects perceptions of the extent to which agents have confidence in and abide by the rules of society, and in particular the quality of contract enforcement, property rights, the police, and the courts, as well as the likelihood of crime and violence. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"},
                    {"indicator": "gi6",
                        "name": "Control of Corruption",
                        "infoCardText": "Reflects perceptions of the extent to which public power is exercised for private gain, including both petty and grand forms of corruption, as well as \"capture\" of the state by elites and private interests. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"}
                    ]

const govAttributeMap = d3.map(govAttributes, d => d.indicator)

// dynamically set drop down 1 for governance indicators
a=d3.select("#dropdownDiv1").selectAll("a")
     .data(govAttributes)
     .enter()
     .append("a")
        .attr("class", "dropdown-item")
        .attr("href", "#")
        .attr("data-toggle", "collapse")
        .attr("data-target", "#navbarNavDropdown.show")
        .on("click", d => rerender(d.indicator, null))
        .text(d => d.name);

// Handle data initialization of performance indicators
const perfAttributes = [ {"indicator": "pi1",
                        "name": "Total Points",
                        "infoCardText": "Points scored by a nation during the world cup. A win is worth 3 points, a draw/tie is worth 1 point, and a loss is worth no points. Ranges from 0 points to 21 points possible, as a maximum of 7 games are played.",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".0f",
                        "inputID": "pi1-trigger"},
                    {"indicator": "pi2",
                        "name": "Average Points",
                        "infoCardText": "The total number of points scored by a nation divided by the number of games played during the World Cup.  A win is worth 3 points, a draw/tie is worth 1 point, and a loss is worth no points. Ranges from 0 points to 3 points.",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".2f",
                        "inputID": "pi2-trigger"},
                    {"indicator": "pi3",
                        "name": "Average Goal Differential",
                        "infoCardText": "The total number of goals scored against a nation subtracted from the total goals scored by that nation, then divided by the number of games played during the World Cup. Minimum and maximum values vary.",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".1f",
                        "inputID": "pi3-trigger"}
                    ]

const perfAttributeMap = d3.map(perfAttributes, d => d.indicator)

// create svg to hold the world cup logo above the pi section
var wclogoSVG = d3.select('#wclogo')
    .append('svg')
        .attr("width", window.innerWidth * 0.11 + 'px')
        .attr("height", window.innerWidth * 0.11 + 'px')
        .call(responsivefy);

var wclogoSVG_panel = d3.select('#wclogo-panel')
    .append('svg')
        .attr("width", window.innerWidth * 0.11 + 'px')
        .attr("height", window.innerWidth * 0.11 + 'px')
        .call(responsivefy);

var buttonDivs = d3.select("#perfButtonDiv").selectAll("div")
    .data(perfAttributes)
    .enter()
    .append("div")
        .attr("align", "left")
        .style("padding-top", "6px")

var toggleInputs = buttonDivs.append("input")
    .attr("id", d => d.inputID)
    .attr("class", "perfToggles")
    .attr("type", "checkbox")
    .attr("data-toggle", "toggle")
    .attr("data-on", "Shown")
    .attr("data-off", "Hidden")
    .attr("data-onstyle", "warning")
    .attr("data-offstyle", "secondary")
    .attr("onchange", d => "perfrender(['" + d.indicator + "', '" + d.inputID + "'])" )
    .attr("data-size", function() {
        if ($(window).width() < 970) {
            return "mini"
        } else if ( ($(window).width() > 970) && ($(window).width() < 1050) ) {
            return "small"
        } else {
            return "normal"
        }
    })

buttonDivs.append("button")
    .attr("type", "checkbox")
    .attr("class", "btn btn-dark perfButtons btn-responsive")
    .on("click", d => toggleFunc(d.indicator))
    .text(d => d.name)
    .style("margin-left", "5px")

const transitionDuration = 1000

// GI color scale for countries who didn't make it into the world cup
const colorScaleGIOut = d3.scaleSequential(d3.interpolateRdYlGn)
// const colorScaleGIOut = d3.scaleLinear()
//     .range(['#ff8000', '#2db300']) // this needs tweaking

// GI color scale for countries who make it into the world cup
const colorScaleGIIn = d3.scaleLinear()
    .range(['#000', '#000']) // this needs tweaking

// PI opacity scale
const colorScalePI = d3.scaleLinear()
    .range([0.3, 1])

Promise.all([
    d3.json('data/worldMap50mSimplified.json', function(error, world) {
        if (error) return console.error(error)}),
    d3.csv('data/fifaData.csv', d => {
        for (var key in d) {
            if (isNaN(+d[key]) || d[key] === '') {
                d[key] = d[key]
            } else {
                d[key] = +d[key]
            }
        }
        return d
    })]
)
    .then(processData)
    .then(createMap)
    .then(disablePI)

function processData(results) {
    const geoJson = topojson.feature(results[0],results[0].objects.ne_50m_admin_0_countries_lakes)
    const cData = results[1]
    var countryArray = []
    for (const feature of geoJson.features) {
        if (feature.properties.CONTINENT != "Antarctica") {
            for (const stat of cData) {
                if (feature.properties.ADM0_A3_US == stat.WBCode) {
                    feature.properties.stat = stat
                    break
                }
            }
            countryArray.push(feature)
        }
    }
    colorScaleGIOut.domain(d3.extent(cData, d=>d[giCurrent]))
    window.cData = cData // globalize
    window.countryArray = countryArray // globalize
    return countryArray
}


function createMap(countryArray) {
    countriesG
       .selectAll('path')
       .data(countryArray)
       .enter()
          .append('path')
             .attr('class', d => 'country ' + d.properties.ADM0_A3_US)
             .attr('d', pathGenerator)
             .style('fill', d => {
                if (d.properties.hasOwnProperty('stat')) {
                    if (d.properties.stat[giCurrent]) {
                       return colorScaleGIOut(d.properties.stat[giCurrent])
                    }
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)
             createSlider();
    return countryArray
}


function moveToolTip(d) {
    if (d.properties.hasOwnProperty('stat')) {
        if (d.properties.stat[giCurrent]) {
            const cPFormat = d3.format(govAttributeMap.get(giSelection).formatText)
            tooltip.html(`
              <p class="tooltip-country-gi">${d.properties.ADMIN}</p><br>
              <p class="performance-attribute">${govAttributeMap.get(giSelection).name}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
            `)
            tooltip.style('opacity', 1)
            let mouseX = d3.event.pageX
            const tooltipWidth = parseInt(tooltip.style('width'))
            if ((mouseX + tooltipWidth + 20) >= widthBody - 17) {
                mouseX = (widthBody - tooltipWidth - 20 - 17)
            }
            tooltip.style('left', (mouseX + 10) + 'px')
            tooltip.style('top', (d3.event.pageY + 20) + 'px')

            d3.selectAll("." + d.properties.ADM0_A3_US)
                .style('stroke', '#fff')
                .style('stroke-width', '2')
                .raise()
        }
    }
}

function hideToolTip(d) {
    tooltip.style('opacity', 0)
    d3.selectAll("." + d.properties.ADM0_A3_US)
        .style('stroke', 'white')
        .style('stroke-width', '0.5')
}



//attribute panel text
d3.select('.card-header')
    .text(govAttributeMap.get(giSelection).name)
    .style('font-weight', 700)
d3.select('.card-text')
    .text(govAttributeMap.get(giSelection).infoCardText)


 /*d3.select('.infocard')
    .style('left', 0 + 'px')
    .style('height',100 + 'vh')
    .style('top', height/300 + 'px')
    .style('border-top-left-radius',0 + 'px')
    .style('border-top-right-radius',0 + 'px')
    .style('border-bottom-left-radius',0 + 'px')
    //.style('width', width/4.5 + 'px')
    .style('width', 293 + 'px')
 d3.select('.card .card-header')
    .text(govAttributeMap.get(giSelection).name)
    .style('font-weight', 700)
 d3.select('.card-text')
    .text(govAttributeMap.get(giSelection).infoCardText)
 d3.select('.card .card-body a')
    .attr("href", govAttributeMap.get(giSelection).infoCardLinkURL)
 d3.select('.sourceLink')
    .text(govAttributeMap.get(giSelection).infoCardLinkTitle)*/

//create slider
function createSlider(giNew){
      var slider = d3.sliderHorizontal()
        .min(d3.min(dataSlider))
        .max(d3.max(dataSlider))
        .step(2)
        .width(800)
        .tickFormat(d3.format('.0f'))
        .tickValues(dataSlider)
        .on('onchange', function(val){
          d3.select("p#value").text((val));
          //console.log(val)
          worldCupYearPanel(val)
          worldCupYearColor(val)
          rerender(giNew,val)

        })

      var g = d3.select("#slider")
        .append("div")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-55 20 1300 90")
        .append("g")
        .attr("transform", "translate(30,30)")

      g.call(slider);
      //d3.select("p#value").text(slider.value());
      //d3.select("a#setValue").on("click", () => slider.value(data));
}

//updates color of the year container within the slide out panel
function worldCupYearPanel(val){
    if (worldCupYears.includes(val)) {
      $("#value").css('color', '#ce4d3b');
    } else if (!worldCupYears.includes(val)) {
      $("#value").css('color', 'white');
    }
}

var worldCupYearColorInd = 0 // track calls to worldCupYearColor for soccerBall removal
//adds image to world cup years and changes style
function worldCupYearColor(val){

    // if the function has been called before remove .soccer-ball
    if (worldCupYearColorInd > 0) {
        d3.select(".soccer-ball").remove()
    }
    if (worldCupYears.includes(val)) {

        wcLogoFile = "world-cup-" + val.toString() + ".png"
        soccerBall = "soccer_favicon.png"

        d3.select(".display-value")
            .attr("fill","#ce4d3b") //#ce4d3b #dc3839 #ec7254
            .attr("font-size","28")
            .attr("dy", "0.6em");

        var width = 200,
            height = 200;

        var svg = d3.select(".parameter-value").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("x", -17)
            .attr("y", 20)

        var img = svg.append("svg:image")
            .attr("class", "soccer-ball")
            .attr("xlink:href", "img/" + soccerBall)
            .attr("width", 36)
            .attr("height", 36)
            .attr("x", 0)
            .attr("y",25)

        worldCupYearColorInd += 1 // increment call counter for this function

    } else if (!worldCupYears.includes(val)) {
        d3.select(".display-value")
            .attr("fill","white")
            .attr("font-size", 28)
            .attr("y", 20)
            .attr("dy", "0.65em")
    }
}

//function to update PI info card based on active pi
function addPICard(ind){
    d3.select('.pi-header')
      .text(perfAttributeMap.get(ind).name)
    d3.select('.pi-text')
      .text(perfAttributeMap.get(ind).infoCardText)
}
//function to toggle the PI info card show/hide
function togglePICard(piNum){
    if(document.getElementById("pi" + piNum + "-trigger").checked) {
        $('#piCard').css('display', 'block');
    } else {
        $('#piCard').css('display', 'none');;
    }
}
function hidePICard(){
    if ($("#piCard").css('display') == 'block'){
        $('#piCard').css('display', 'none');;
    }
}

function toggleFunc(ind) {
    addPICard(ind)
    switch (ind) {
        case 'pi1':
            $('#pi1-trigger').bootstrapToggle('toggle')
            togglePICard(1)
            break
        case 'pi2':
            $('#pi2-trigger').bootstrapToggle('toggle')
            togglePICard(2)
            break
        case 'pi3':
            $('#pi3-trigger').bootstrapToggle('toggle')
            togglePICard(3)
            break
    }
}

var rerenderInd = 0 // track calls to worldCupYearColor for soccerBall removal

// function to handle changes to the gi's or years
function rerender(giNew, yearNew) {
    if (giNew != null) { // if gi change
        giSelection = giNew

        // if the rerender function has been called before remove .soccer-ball
        if (rerenderInd == 0) {
            d3.selectAll(".country")
                .style("opacity", 1)
        }
    } else if (yearNew != null) { // if year change

        // set globals
        yearSelection = yearNew
        piCurrent = piSelection + "_" + yearSelection


        // disable/enable PI toggles appropriately
        if (worldCupYears.includes(+yearSelection)) {
            enablePI()

            perfrender([piSelection, perfAttributeMap.get(piSelection).inputID])
        } else {
            // on year change to non world cup year, return all pi toggles to off
            $('#pi1-trigger').bootstrapToggle('off')
            $('#pi2-trigger').bootstrapToggle('off')
            $('#pi3-trigger').bootstrapToggle('off')

            // year change sets opacity to 1
            d3.selectAll(".country")
            .style("opacity", 1)

            // disablePI()
            hidePICard()
        }

        // remove old world cup year logo
        d3.select(".wclogoImage").remove()
        d3.select(".wclogoImage-attr").remove()

        // disable/enable PI toggles appropriately, show wc logo
        if (worldCupYears.includes(+yearSelection)) {
            enablePI()

            // add wc logo img
            wcLogoFile = "world-cup-" + yearSelection + ".png"
            wclogoSVG.append("svg:image")
                .attr("class", "wclogoImage")
                .attr("xlink:href", "img/" + wcLogoFile)
                .attr("width", window.innerWidth * 0.10 + 'px')
                .attr("height", window.innerWidth * 0.10 + 'px')

            wclogoSVG_panel.append("svg:image")
                .attr("class", "wclogoImage-attr")
                .attr("xlink:href", "img/" + wcLogoFile)
                .attr("width", window.innerWidth * 0.10 + 'px')
                .attr("height", window.innerWidth * 0.10 + 'px')
            $("#wclogo-panel").css("background-color", "rgba(255,255,255,0.9)");
        } else {
            disablePI()
            $("#wclogo-panel").css("background-color", "rgba(255,255,255,0)");
        }
    }

    // set globals
    giCurrent = giSelection + "_" + yearSelection
    rerenderInd += 1

    // get format for gi
    const cPFormat = d3.format(govAttributeMap.get(giSelection).formatText)
    
    // Reset indicator text on nav bar
    if (giSelection.startsWith('g')){
        d3.select("#navbarDropdownMenuLink1")
          .text(govAttributeMap.get(giSelection).name);
        colorScaleGIOut.domain([-2.5, 2.5]);
    }
    else if (giSelection.startsWith('p')){
        d3.select("#navbarDropdownMenuLink2")
          .text(perfAttributeMap.get(giSelection).name);
        //need to calculate and assign domain to perf
    }


    // Change map fill and tooltip text upon indicator change
    d3.selectAll(".country")
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip)
        .transition()
            .duration(transitionDuration)
            .style("fill", d => {
                outColor = "#808080"
                if (d.properties.hasOwnProperty('stat')) {
                    if (typeof d.properties.stat[giCurrent] === 'number') {
                        outColor = colorScaleGIOut(d.properties.stat[giCurrent]);
                    }
                }
                return outColor
            })

    function moveToolTip(d) {
        if (d.properties.hasOwnProperty('stat')) {
            if(typeof d.properties.stat[giCurrent] === 'string'){
                if (d.properties.stat[giCurrent] && d.properties.stat[piCurrent] ) {
                    tooltip.html(`
                      <p id="tooltip-country">${d.properties.ADMIN}</p><br>
                      <p class="performance-attribute">${perfAttributeMap.get(piSelection).name}<span class="number"> ${cPFormat(d.properties.stat[piCurrent])}</span></p><br>
                      <p class="performance-attribute"><span class="number">No Data</span></p>
                `)} else {
                      tooltip.html(`
                        <p class="tooltip-country-gi">${d.properties.ADMIN}</p><br>
                        <p class="performance-attribute"><span class="number">No Data</span></p>
                `)}
            }else{
            
                if (d.properties.stat[giCurrent] && d.properties.stat[piCurrent] ) {
                    tooltip.html(`
                      <p id="tooltip-country">${d.properties.ADMIN}</p><br>
                      <p class="performance-attribute">${perfAttributeMap.get(piSelection).name}<span class="number"> ${cPFormat(d.properties.stat[piCurrent])}</span></p><br>
                      <p class="performance-attribute">${govAttributeMap.get(giSelection).name}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
                `)} else {
                      tooltip.html(`
                        <p class="tooltip-country-gi">${d.properties.ADMIN}</p><br>
                        <p class="performance-attribute">${govAttributeMap.get(giSelection).name}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
                `)}
            }
                tooltip.style('opacity', 1)
                let mouseX = d3.event.pageX
                const tooltipWidth = parseInt(tooltip.style('width'))
                if ((mouseX + tooltipWidth + 20) >= widthBody - 17) {
                    mouseX = (widthBody - tooltipWidth - 20 - 17)
                }
                tooltip.style('left', (mouseX + 10) + 'px')
                tooltip.style('top', d3.event.pageY + 20 + 'px')

                d3.selectAll("." + d.properties.ADM0_A3_US)
                    .style('stroke', '#fff')
                    .style('stroke-width', '2.5')
                    .raise()

        }
    }

    function hideToolTip(d) {
        tooltip.style('opacity', 0)
        d3.selectAll("." + d.properties.ADM0_A3_US)
                .style('stroke', 'white')
                .style('stroke-width', '0.5')
    }

    //attribute panel text
    d3.select('.card-header')
        .text(govAttributeMap.get(giSelection).name)
    d3.select('.card-text')
        .text(govAttributeMap.get(giSelection).infoCardText)
    d3.select('.card .card-body a')
        .attr("href", govAttributeMap.get(giSelection).infoCardLinkURL)
    d3.select('.sourceLink')
        .text(govAttributeMap.get(giSelection).infoCardLinkTitle)
}

// function to change opacity of countries based on PI
function perfrender(inputs) {

    // true if user detoggles all PI
    var anyCheckBool = !document.getElementById("pi1-trigger").checked && !document.getElementById("pi2-trigger").checked && !document.getElementById("pi3-trigger").checked

    if (anyCheckBool && rerenderInd > 0 ) { // if user detoggles all PI and after the initial page render
        d3.selectAll(".country")
            .style("opacity", 1)
        hidePICard()
        return
    }

    // true if current call to perfrender is by toggled that is toggled to 'shown'
    var checkBool = document.getElementById(inputs[1]).checked

    if (checkBool) { // if user has selected the current PI (as opposed to deselected it)

        // initialize globals piSelection, otherwise this perfrender call is a deselect, so don't set
        piSelection = inputs[0]

        switch (piSelection) { // turn off other toggles
            case 'pi1':
                addPICard(piSelection)
                $('#pi2-trigger').bootstrapToggle('off')
                $('#pi3-trigger').bootstrapToggle('off')
                togglePICard(1)
                break
            case 'pi2':
                addPICard(piSelection)
                $('#pi1-trigger').bootstrapToggle('off')
                $('#pi3-trigger').bootstrapToggle('off')
                togglePICard(2)
                break
            case 'pi3':
                addPICard(piSelection)
                $('#pi1-trigger').bootstrapToggle('off')
                $('#pi2-trigger').bootstrapToggle('off')
                togglePICard(3)
                break
        }

        // initialize global piCurrent
        piCurrent = piSelection + "_" + yearSelection

        // get format for pi
        const cPFormat = d3.format(perfAttributeMap.get(piSelection).formatText)

        colorScalePI.domain(d3.extent(cData, d=>d[piCurrent]))

        d3.selectAll(".country")
            .on("mousemove", moveToolTip)
            .on("mouseout", hideToolTip)
                .style("opacity", d => {
                    if (d.properties.hasOwnProperty('stat')) {
                        if (d.properties.stat[piCurrent] !== ''){
                            return colorScalePI(d.properties.stat[piCurrent])
                        } else { 
                            return 0.15
                        }
                    } else { 
                        return 0.15
                    }
                })

        function moveToolTip(d) {
            if (d.properties.stat[giCurrent] && d.properties.stat[piCurrent] ) {
                tooltip.html(`
                <p id="tooltip-country">${d.properties.ADMIN}</p><br>
                <p class="performance-attribute">${perfAttributeMap.get(piSelection).name}<span class="number"> ${cPFormat(d.properties.stat[piCurrent])}</span></p><br>
                <p class="performance-attribute">${govAttributeMap.get(giSelection).name}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
                `)} else {
                tooltip.html(`
                    <p class="tooltip-country-gi">${d.properties.ADMIN}</p><br>
                    <p class="performance-attribute">${govAttributeMap.get(giSelection).name}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
                    `)}

                tooltip.style('opacity', 1)
                let mouseX = d3.event.pageX
                const tooltipWidth = parseInt(tooltip.style('width'))
                if ((mouseX + tooltipWidth + 20) >= widthBody - 17) {
                    mouseX = (widthBody - tooltipWidth - 20 - 17)
                }
                tooltip.style('left', (mouseX + 10) + 'px')
                tooltip.style('top', d3.event.pageY + 20 + 'px')

                d3.selectAll("." + d.properties.ADM0_A3_US)
                    .style('stroke', '#fff')
                    .style('stroke-width', '2.5')
                    .raise()
        }

        function hideToolTip(d) {
            tooltip.style('opacity', 0)
            d3.selectAll("." + d.properties.ADM0_A3_US)
                    .style('stroke', 'white')
                    .style('stroke-width', '0.5')
        }
    }
}


// function to disable PI button
function disablePI() {
    d3.selectAll('.perfButtons')
        .property('disabled', true)

    $("#pi1-trigger").bootstrapToggle('off');
    $("#pi2-trigger").bootstrapToggle('off');
    $("#pi2-trigger").bootstrapToggle('off');

    buttonDivs.selectAll('div')
        .classed("disabled", true)

    $('.perfToggles').bootstrapToggle('disable')
}

// function to enable PI button
function enablePI() {
    d3.selectAll('.perfButtons')
        .property('disabled', false)

    buttonDivs.selectAll('div')
        .classed("disabled", false)

    $('.perfToggles').bootstrapToggle('enable')
}
