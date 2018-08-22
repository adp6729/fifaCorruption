// main.js
// authors: Andrew Pittman, Vlad Sliusar, Zheng Li

// Corruption and Governance map of Africa
const body = d3.select("body")
const container = d3.select(".map-container")
const chart = d3.select(".bar-chart")
const tooltip = d3.select(".main-tooltip")

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


    //create slider
    var dataSlider = [1996,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016];

      var slider = d3.sliderHorizontal()
        .min(d3.min(dataSlider))
        .max(d3.max(dataSlider))
        .step(2)
        .width(800)
        .tickFormat(d3.format('.0f'))
        .tickValues(dataSlider)
        .on('onchange', val => {
          d3.select("p#value").text((val));
        });

      var g = d3.select("#slider")
        .append("div")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-55 20 1300 90")
        .append("g")
        .attr("transform", "translate(30,30)");

      g.call(slider);

      d3.select("p#value").text(slider.value());
      d3.select("a#setValue").on("click", () => slider.value(data));

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
                        "name": "Conrtol of Corruption",
                        "infoCardText": "Reflects perceptions of the extent to which public power is exercised for private gain, including both petty and grand forms of corruption, as well as \"capture\" of the state by elites and private interests. Attribute ranges from -2.5 (weak) to 2.5 (strong) governance performance.",
                        "infoCardLinkURL": "www.govindicators.org",
                        "infoCardLinkTitle": "The World Bank",
                        "formatText": ".1f"}
                    ]

const govAttributeMap = d3.map(govAttributes, d => d.indicator)

// dynamically set drop down 1 for governance indicators
d3.select("#dropdownDiv1").selectAll("a")
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
                        "formatText": ".0f"},
                    {"indicator": "pi2",
                        "name": "Average Points",
                        "infoCardText": "The total number of points scored by a nation divided by the number of games played during the World Cup. Ranges from 0 points",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".2f"},
                    {"indicator": "pi3",
                        "name": "Average Goal Differential",
                        "infoCardText": "The total number of goals scored against a nation subtracted from the total goals scored by that nation, then divided by the number of games played during the World Cup. Minimum and maximum values vary.",
                        "infoCardLinkURL": "www.wikipedia.org",
                        "infoCardLinkTitle": "Wikipedia",
                        "formatText": ".1f"}
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
        .on("click", d => perfrender(d.indicator + "_" + yearSelection))
        .text(d => d.name);

const transitionDuration = 1000

const colorScale = d3.scaleLinear()
    .range(['#fee5d9', '#a50f15'])

const colorScaleMoney = d3.scaleLinear()
    .range(['#d7f2cd', '#006d2c'])

Promise.all([
    d3.json('data/worldMap50mSimplified.json', function(error, world) {
        if (error) return console.error(error)}),
    d3.csv('data/fifaData.csv', d => {
       d.gi1_1996 = +d.gi1_1996
       d.gi2_1996 = +d.gi2_1996
       d.gi3_1996 = +d.gi3_1996
       d.gi4_1996 = +d.gi4_1996
       d.gi5_1996 = +d.gi5_1996
       d.gi6_1996 = +d.gi6_1996
       d.pi1_1996 = +d.pi1_1996
       d.pi2_1996 = +d.pi2_1996
       d.pi3_1996 = +d.pi3_1996
       d.gi1_1998 = +d.gi1_1998
       d.gi2_1998 = +d.gi2_1998
       d.gi3_1998 = +d.gi3_1998
       d.gi4_1998 = +d.gi4_1998
       d.gi5_1998 = +d.gi5_1998
       d.gi6_1998 = +d.gi6_1998
       d.pi1_1998 = +d.pi1_1998
       d.pi2_1998 = +d.pi2_1998
       d.pi3_1998 = +d.pi3_1998
       d.gi1_2000 = +d.gi1_2000
       d.gi2_2000 = +d.gi2_2000
       d.gi3_2000 = +d.gi3_2000
       d.gi4_2000 = +d.gi4_2000
       d.gi5_2000 = +d.gi5_2000
       d.gi6_2000 = +d.gi6_2000
       d.pi1_2000 = +d.pi1_2000
       d.pi2_2000 = +d.pi2_2000
       d.pi3_2000 = +d.pi3_2000
       d.gi1_2002 = +d.gi1_2002
       d.gi2_2002 = +d.gi2_2002
       d.gi3_2002 = +d.gi3_2002
       d.gi4_2002 = +d.gi4_2002
       d.gi5_2002 = +d.gi5_2002
       d.gi6_2002 = +d.gi6_2002
       d.pi1_2002 = +d.pi1_2002
       d.pi2_2002 = +d.pi2_2002
       d.pi3_2002 = +d.pi3_2002
       d.gi1_2004 = +d.gi1_2004
       d.gi2_2004 = +d.gi2_2004
       d.gi3_2004 = +d.gi3_2004
       d.gi4_2004 = +d.gi4_2004
       d.gi5_2004 = +d.gi5_2004
       d.gi6_2004 = +d.gi6_2004
       d.pi1_2004 = +d.pi1_2004
       d.pi2_2004 = +d.pi2_2004
       d.pi3_2004 = +d.pi3_2004
       d.gi1_2006 = +d.gi1_2006
       d.gi2_2006 = +d.gi2_2006
       d.gi3_2006 = +d.gi3_2006
       d.gi4_2006 = +d.gi4_2006
       d.gi5_2006 = +d.gi5_2006
       d.gi6_2006 = +d.gi6_2006
       d.pi1_2006 = +d.pi1_2006
       d.pi2_2006 = +d.pi2_2006
       d.pi3_2006 = +d.pi3_2006
       d.gi1_2008 = +d.gi1_2008
       d.gi2_2008 = +d.gi2_2008
       d.gi3_2008 = +d.gi3_2008
       d.gi4_2008 = +d.gi4_2008
       d.gi5_2008 = +d.gi5_2008
       d.gi6_2008 = +d.gi6_2008
       d.pi1_2008 = +d.pi1_2008
       d.pi2_2008 = +d.pi2_2008
       d.pi3_2008 = +d.pi3_2008
       d.gi1_2010 = +d.gi1_2010
       d.gi2_2010 = +d.gi2_2010
       d.gi3_2010 = +d.gi3_2010
       d.gi4_2010 = +d.gi4_2010
       d.gi5_2010 = +d.gi5_2010
       d.gi6_2010 = +d.gi6_2010
       d.pi1_2010 = +d.pi1_2010
       d.pi2_2010 = +d.pi2_2010
       d.pi3_2010 = +d.pi3_2010
       d.gi1_2012 = +d.gi1_2012
       d.gi2_2012 = +d.gi2_2012
       d.gi3_2012 = +d.gi3_2012
       d.gi4_2012 = +d.gi4_2012
       d.gi5_2012 = +d.gi5_2012
       d.gi6_2012 = +d.gi6_2012
       d.pi1_2012 = +d.pi1_2012
       d.pi2_2012 = +d.pi2_2012
       d.pi3_2012 = +d.pi3_2012
       d.gi1_2014 = +d.gi1_2014
       d.gi2_2014 = +d.gi2_2014
       d.gi3_2014 = +d.gi3_2014
       d.gi4_2014 = +d.gi4_2014
       d.gi5_2014 = +d.gi5_2014
       d.gi6_2014 = +d.gi6_2014
       d.pi1_2014 = +d.pi1_2014
       d.pi2_2014 = +d.pi2_2014
       d.pi3_2014 = +d.pi3_2014
       d.gi1_2016 = +d.gi1_2016
       d.gi2_2016 = +d.gi2_2016
       d.gi3_2016 = +d.gi3_2016
       d.gi4_2016 = +d.gi4_2016
       d.gi5_2016 = +d.gi5_2016
       d.gi6_2016 = +d.gi6_2016
       d.pi1_2016 = +d.pi1_2016
       d.pi2_2016 = +d.pi2_2016
       d.pi3_2016 = +d.pi3_2016
       return d
    })]

)
    .then(processData)
    .then(createMap)

function processData(results) {
    const geoJson = topojson.feature(results[0],results[0].objects.ne_50m_admin_0_countries_lakes)
    const cData = results[1]
    var countryArray = []
    for (const feature of geoJson.features) {
        if (feature.properties.CONTINENT != "Antarctica") {
            for (const stat of cData) {
                if (feature.properties.ADM0_A3_US == stat.WBCode) {
//                     feature.properties.stat = stat
//                     feature.properties.gi1_1996 = stat.gi1_1996
//                     feature.properties.gi2_1996 = stat.gi2_1996
//                     feature.properties.gi3_1996 = stat.gi3_1996
//                     feature.properties.gi4_1996 = stat.gi4_1996
//                     feature.properties.gi5_1996 = stat.gi5_1996
//                     feature.properties.gi6_1996 = stat.gi6_1996
//                     feature.properties.pi1_1996 = stat.pi1_1996
//                     feature.properties.pi2_1996 = stat.pi2_1996
//                     feature.properties.pi3_1996 = stat.pi3_1996
//                     feature.properties.gi1_1998 = stat.gi1_1998
//                     feature.properties.gi2_1998 = stat.gi2_1998
//                     feature.properties.gi3_1998 = stat.gi3_1998
//                     feature.properties.gi4_1998 = stat.gi4_1998
//                     feature.properties.gi5_1998 = stat.gi5_1998
//                     feature.properties.gi6_1998 = stat.gi6_1998
//                     feature.properties.pi1_1998 = stat.pi1_1998
//                     feature.properties.pi2_1998 = stat.pi2_1998
//                     feature.properties.pi3_1998 = stat.pi3_1998
//                     feature.properties.gi1_2000 = stat.gi1_2000
//                     feature.properties.gi2_2000 = stat.gi2_2000
//                     feature.properties.gi3_2000 = stat.gi3_2000
//                     feature.properties.gi4_2000 = stat.gi4_2000
//                     feature.properties.gi5_2000 = stat.gi5_2000
//                     feature.properties.gi6_2000 = stat.gi6_2000
//                     feature.properties.pi1_2000 = stat.pi1_2000
//                     feature.properties.pi2_2000 = stat.pi2_2000
//                     feature.properties.pi3_2000 = stat.pi3_2000
//                     feature.properties.gi1_2002 = stat.gi1_2002
//                     feature.properties.gi2_2002 = stat.gi2_2002
//                     feature.properties.gi3_2002 = stat.gi3_2002
//                     feature.properties.gi4_2002 = stat.gi4_2002
//                     feature.properties.gi5_2002 = stat.gi5_2002
//                     feature.properties.gi6_2002 = stat.gi6_2002
//                     feature.properties.pi1_2002 = stat.pi1_2002
//                     feature.properties.pi2_2002 = stat.pi2_2002
//                     feature.properties.pi3_2002 = stat.pi3_2002
//                     feature.properties.gi1_2004 = stat.gi1_2004
//                     feature.properties.gi2_2004 = stat.gi2_2004
//                     feature.properties.gi3_2004 = stat.gi3_2004
//                     feature.properties.gi4_2004 = stat.gi4_2004
//                     feature.properties.gi5_2004 = stat.gi5_2004
//                     feature.properties.gi6_2004 = stat.gi6_2004
//                     feature.properties.pi1_2004 = stat.pi1_2004
//                     feature.properties.pi2_2004 = stat.pi2_2004
//                     feature.properties.pi3_2004 = stat.pi3_2004
//                     feature.properties.gi1_2006 = stat.gi1_2006
//                     feature.properties.gi2_2006 = stat.gi2_2006
//                     feature.properties.gi3_2006 = stat.gi3_2006
//                     feature.properties.gi4_2006 = stat.gi4_2006
//                     feature.properties.gi5_2006 = stat.gi5_2006
//                     feature.properties.gi6_2006 = stat.gi6_2006
//                     feature.properties.pi1_2006 = stat.pi1_2006
//                     feature.properties.pi2_2006 = stat.pi2_2006
//                     feature.properties.pi3_2006 = stat.pi3_2006
//                     feature.properties.gi1_2008 = stat.gi1_2008
//                     feature.properties.gi2_2008 = stat.gi2_2008
//                     feature.properties.gi3_2008 = stat.gi3_2008
//                     feature.properties.gi4_2008 = stat.gi4_2008
//                     feature.properties.gi5_2008 = stat.gi5_2008
//                     feature.properties.gi6_2008 = stat.gi6_2008
//                     feature.properties.pi1_2008 = stat.pi1_2008
//                     feature.properties.pi2_2008 = stat.pi2_2008
//                     feature.properties.pi3_2008 = stat.pi3_2008
//                     feature.properties.gi1_2010 = stat.gi1_2010
//                     feature.properties.gi2_2010 = stat.gi2_2010
//                     feature.properties.gi3_2010 = stat.gi3_2010
//                     feature.properties.gi4_2010 = stat.gi4_2010
//                     feature.properties.gi5_2010 = stat.gi5_2010
//                     feature.properties.gi6_2010 = stat.gi6_2010
//                     feature.properties.pi1_2010 = stat.pi1_2010
//                     feature.properties.pi2_2010 = stat.pi2_2010
//                     feature.properties.pi3_2010 = stat.pi3_2010
//                     feature.properties.gi1_2012 = stat.gi1_2012
//                     feature.properties.gi2_2012 = stat.gi2_2012
//                     feature.properties.gi3_2012 = stat.gi3_2012
//                     feature.properties.gi4_2012 = stat.gi4_2012
//                     feature.properties.gi5_2012 = stat.gi5_2012
//                     feature.properties.gi6_2012 = stat.gi6_2012
//                     feature.properties.pi1_2012 = stat.pi1_2012
//                     feature.properties.pi2_2012 = stat.pi2_2012
//                     feature.properties.pi3_2012 = stat.pi3_2012
//                     feature.properties.gi1_2014 = stat.gi1_2014
//                     feature.properties.gi2_2014 = stat.gi2_2014
//                     feature.properties.gi3_2014 = stat.gi3_2014
//                     feature.properties.gi4_2014 = stat.gi4_2014
//                     feature.properties.gi5_2014 = stat.gi5_2014
//                     feature.properties.gi6_2014 = stat.gi6_2014
//                     feature.properties.pi1_2014 = stat.pi1_2014
//                     feature.properties.pi2_2014 = stat.pi2_2014
//                     feature.properties.pi3_2014 = stat.pi3_2014
//                     feature.properties.gi1_2016 = stat.gi1_2016
//                     feature.properties.gi2_2016 = stat.gi2_2016
//                     feature.properties.gi3_2016 = stat.gi3_2016
//                     feature.properties.gi4_2016 = stat.gi4_2016
//                     feature.properties.gi5_2016 = stat.gi5_2016
//                     feature.properties.gi6_2016 = stat.gi6_2016
//                     feature.properties.pi1_2016 = stat.pi1_2016
//                     feature.properties.pi2_2016 = stat.pi2_2016
//                     feature.properties.pi3_2016 = stat.pi3_2016
                    break
                }
            }
            countryArray.push(feature)
        }
    }
    colorScale.domain(d3.extent(cData, d=>d[giCurrent]))
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
                if (d.properties.stat[giCurrent]) {
                   return colorScale(d.properties.stat[giCurrent])
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)

    return countryArray
 }


 function moveToolTip(d) {
    if (d.properties.stat[giCurrent]) {
       const cPFormat = d3.format(govAttributeMap.get(giCurrent).formatText)
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

 function hideToolTip(d) {
    if (d.properties.stat[giCurrent]) {
        tooltip.style('opacity', 0)
        d3.select(".country." + d.properties.ADM0_A3_US)
            .style('stroke', 'white')
            .style('stroke-width', '0.5')
    }
 }



    //attribute panel text
    d3.select('.card-header')
       .text(govAttributeMap.get(giCurrent).name)
       .style('font-weight', 700)
    d3.select('.card-text')
       .text(govAttributeMap.get(giCurrent).infoCardText)

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

function rerender(giNew, yearNew) {
    if (giNew != null) {
        giSelection = giNew
    } else if (yearNew != null) {
        yearSelection = yearNew
        piCurrent = piSelection + "_" + yearSelection
    }
    giCurrent = giSelection + "_" + yearSelection
    
    const dataString = "d.properties.stat." + giSelection;
    const cPFormat = d3.format(govAttributeMap.get(giSelection).formatText)
//    const tickFormat = d3.format(govAttributeMap.get(giSelection).formatScale)
//    if (govAttributeMap.get(giSelection).formatText.includes('$')) {
//        colorScaleMoney.domain(govAttributeMap.get(giSelection).domainData)
//        var moneyFlag = true
//    } else {
//        colorScale.domain(govAttributeMap.get(giSelection).domainData)
//        var moneyFlag = false
//    }

    // Reset indicator text on nav bar
    if (giSelection.startsWith('g')){
        d3.select("#navbarDropdownMenuLink1")
          .text(govAttributeMap.get(giSelection).name);
        colorScale.domain([-2.5, 2.5]);
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
                console.log(dataString);
                if (eval(dataString)) {
//                    if (moneyFlag) {
//                        outColor = colorScaleMoney(eval(dataString))
//                    } else {
//                        outColor = colorScale(eval(dataString))
//                    }
                    outColor = colorScale(eval(dataString));
                }
                return outColor
            })

    function moveToolTip(d) {
        if (eval(dataString)) {
            tooltip.html(`
                <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(eval(dataString))}</span></p>
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

    function hideToolTip(d) {
        tooltip.style('opacity', 0)
        d3.select(".country." + d.properties.ADM0_A3_US)
                .style('stroke', 'white')
                .style('stroke-width', '1')
        d3.select(".bar." + d.properties.ADM0_A3_US)
            .style('stroke-width', '0')
        }



    //attribute panel text
    d3.select('.card-header')
        .text(govAttributeMap.get(giCurrent).name)
    d3.select('.card-text')
        .text(govAttributeMap.get(giCurrent).infoCardText)
    d3.select('.card .card-body a')
        .attr("href", govAttributeMap.get(giCurrent).infoCardLinkURL)
    d3.select('.sourceLink')
        .text(govAttributeMap.get(giCurrent).infoCardLinkTitle)
}
