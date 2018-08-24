// main.js
// authors: Andrew Pittman, Vlad Sliusar, Zheng Li

// Corruption and Governance map of Africa
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")
const tooltip = d3.select(".main-tooltip")
const dataSlider = [1996,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016]
const widthBody = parseInt(body.style("width"))
const width = parseInt(container.style("width")) - 30
const height = width / 2.05

const projection = d3.geoNaturalEarth1() // projection used for the mercator projection
    .center([10, 0])
    .scale(160)

const pathGenerator = d3.geoPath()
    .projection(projection)

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
            var targetWidth = parseInt(container.style("width"));
            svg.attr("width", targetWidth);
            svg.attr("height", Math.round(targetWidth / aspect));
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
let piSelection = "pi3"
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
                        "name": "Political Stability and Absence of Violence/Terrorism",
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
                        "infoCardText": "Points scored by a nation during the world cup. Ranges from 0 points to 21 points possible.",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".0f",
                        "inputID": "pi1-trigger"},
                    {"indicator": "pi2",
                        "name": "Average Points",
                        "infoCardText": "The total number of points scored by a nation divided by the number of games played during the World Cup. Ranges from 0 points",
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

// dynamically set drop down 2 for performance metrics
d3.select("#dropdownDiv2").selectAll("a")
     .data(perfAttributes)
     .enter()
     .append("a")
        .attr("class", "dropdown-item")
        .attr("href", "#")
        .attr("data-toggle", "collapse")
        .attr("data-target", "#navbarNavDropdown.show")
        .on("click", d => perfrender(d.indicator))
        .text(d => d.name);

var buttonDivs = d3.select("#perfButtonDiv").selectAll("div")
    .data(perfAttributes)
    .enter()
    .append("div")
        // .attr("class", "toggle-group")
        .attr("align", "left")
        .style("padding-top", "8px")

buttonDivs.append("input")
    .attr("id", d => d.inputID)
    .attr("type", "checkbox")
    .attr("data-toggle", "toggle")
    .attr("data-on", "Shown")
    .attr("data-off", "Hidden")
    .attr("data-offstyle", "info")
    .attr("onchange", d => "perfrender(['" + d.indicator + "', '" + d.inputID + "'])" )

buttonDivs.append("button")
    .attr("type", "checkbox")
    .attr("class", "btn btn-success")
    .on("click", d => toggleFunc(d.indicator))
    .text(d => d.name)    
    .style("margin-left", "5px")

const transitionDuration = 1000

// GI color scale for countries who didn't make it into the world cup
const colorScaleGIOut = d3.scaleSequential(d3.interpolateViridis)
    // .range(['#a50f15', '#fee5d9']) // this needs tweaking

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
                <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
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


function toggleFunc(ind) {
    console.log(ind)
    switch (ind) {
        case 'pi1':
            $('#pi1-trigger').bootstrapToggle('toggle')
            $('#pi2-trigger').bootstrapToggle('off')
            $('#pi3-trigger').bootstrapToggle('off')
            break
        case 'pi2':
            $('#pi1-trigger').bootstrapToggle('off')
            $('#pi2-trigger').bootstrapToggle('toggle')
            $('#pi3-trigger').bootstrapToggle('off')
            break
        case 'pi3':
            $('#pi1-trigger').bootstrapToggle('off')
            $('#pi2-trigger').bootstrapToggle('off')
            $('#pi3-trigger').bootstrapToggle('toggle')
            break
    }
}


function rerender(giNew, yearNew) {
    if (giNew != null) {
        giSelection = giNew
    } else if (yearNew != null) {
        yearSelection = yearNew
        piCurrent = piSelection + "_" + yearSelection
    }
    giCurrent = giSelection + "_" + yearSelection

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
                    if (d.properties.stat[giCurrent]) {
                        outColor = colorScaleGIOut(d.properties.stat[giCurrent]);
                    }
                }
                return outColor
            })

    function moveToolTip(d) {
        if (d.properties.hasOwnProperty('stat')) {
            if (d.properties.stat[giCurrent]) {
                tooltip.html(`
                    <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties.stat[giCurrent])}</span></p>
                `)
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
    // initialize globals
    piSelection = inputs[0]
    var checkBool = document.getElementById(inputs[1]).checked

    if (checkBool) { // if user has selected a PI

        switch (piSelection) { // turn off other toggles
            case 'pi1':
                $('#pi2-trigger').bootstrapToggle('off')
                $('#pi3-trigger').bootstrapToggle('off')                
                break
            case 'pi2':
                $('#pi1-trigger').bootstrapToggle('off')
                $('#pi3-trigger').bootstrapToggle('off')
                break
            case 'pi3':
                $('#pi1-trigger').bootstrapToggle('off')
                $('#pi2-trigger').bootstrapToggle('off')
                break
        }

        piCurrent = piSelection + "_" + yearSelection

        colorScalePI.domain(d3.extent(cData, d=>d[piCurrent]))

        d3.selectAll(".country")
            .style("opacity", d => {
                if (d.properties.hasOwnProperty('stat')) {
                    if (d.properties.stat[piCurrent] !== ''){
                        return colorScalePI(d.properties.stat[piCurrent])
                    } else {
                        return 0.15
                    }
                }
            })
    } 

    var anyCheckBool = !document.getElementById("pi1-trigger").checked && !document.getElementById("pi2-trigger").checked && !document.getElementById("pi3-trigger").checked

    if (anyCheckBool) { // if user detoggles all PI
        d3.selectAll(".country")
            .style("opacity", 1)
    }

}

// function to disable PI dropdown button
function disablePI() {
    d3.select('#navbarDropdownMenuLink2')
        .classed('disabled', true)
        .style('color', 'grey')
}

// function to enable PI dropdown button
function enablePI() {
    d3.select('#navbarDropdownMenuLink2')
        .classed('disabled', false)
        .style('color', '#f7ca45')
}
