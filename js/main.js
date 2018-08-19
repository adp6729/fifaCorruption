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

// const projection = d3.geoNaturalEarth1() // projection used
const projection = d3.geoAlbers() // projection used
    .center([10, 5])
    .scale(width/6)
    .translate([width / 2, height / 2])

const pathGenerator = d3.geoPath()
    .projection(projection)


//create new svg container for the map
var svg = d3.select("#Map")
    .classed("svg-container", true) //container class to make it responsive
    .append("div")
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "90 -20 1100 1000")
    .attr("class", "map-container")
    //class to make it responsive
    .classed("svg-content-responsive", true);

const countriesG = svg.append('g')
    .attr('class', 'countries')

// initialize cartogram
var cartogram = d3.cartogram()
    .projection(projection)
    .value(function(d) {
        return Math.random() * 100;
    })

//create slider
var dataSlider = [1996,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016,2018];

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
    .attr("viewBox", "0 5 1100 90")
    .append("g")
    .attr("transform", "translate(30,30)");

    g.call(slider);

    d3.select("p#value").text(slider.value());
    d3.select("a#setValue").on("click", () => slider.value(data));


// Handle data initialization
const attributes = [ {"indicator": "CorruptionPerceptionIndex2015",
                        "name": "Corruption Perception Index",
                        "infoCardText": "Transparency International\'s Corruption Perception Index: Low scores indicate that a country is perceived as highly corrupt.",
                        "infoCardLinkURL": "https://ourworldindata.org/corruption",
                        "infoCardLinkTitle": "Our World in Data",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [0, 100],
                        "domainBar": [0, 100]},
                    {"indicator": "CorruptionControl2015",
                        "name": "Corruption Control",
                        "infoCardText": "World Bank's Corruption Control Index: Perceptions of the extent to which public power is exercised for private gain, including both petty and grand forms of corruption, as well as \"capture\" of the state by elites and private interests.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [0, 100],
                        "domainBar": [0, 100]},
                    {"indicator": "IbrahimIndex2015",
                        "name": "Ibrahim Index Rank",
                        "infoCardText": "The Ibrahim Index of African Governance (IIAG), generated my the Mo Ibrahim Foundation, ranks governance performance in African countries.",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [55, 0],
                        "domainBar": [0, 55]},
                    {"indicator": "EaseOfDoingBusinessRank2015",
                        "name": "Ease of Doing Business Rank",
                        "infoCardText": "This topic tracks the procedures that agregate a number of indicators that shows the global level of difficulty of doing business in a given country",
                        "infoCardLinkURL": "http://dataportal.opendataforafrica.org/lfkgixg/governance",
                        "infoCardLinkTitle": "Africa Information Highway",
                        "formatText": ".0f",
                        "formatScale": ".0f",
                        "domainData": [195, 0],
                        "domainBar": [0, 195]},
                    {"indicator": "NAIPerAdultDollars2017",
                        "name": "National Average Income Per Adult",
                        "infoCardText": "National income garnered by every adult in a country divided by the number of adults in that country. Converted to USD.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f",
                        "formatScale": "~s",
                        "domainData": [0, 35000],
                        "domainBar": [0, 35000]},
                    {"indicator": "GDPPerAdultDollars2017",
                        "name": "Gross Domestic Product Per Adult",
                        "infoCardText": "Gross domestic product total generated by a country divided by the number of adults in that country. Converted to USD.",
                        "infoCardLinkURL": "https://wid.world/data/",
                        "infoCardLinkTitle": "World Inequality Database",
                        "formatText": "$,.0f",
                        "formatScale": "~s",
                        "domainData": [0, 45000],
                        "domainBar": [0, 45000]}
                    ]

const attributeMap = d3.map(attributes, d => d.indicator)

const selectionIndicator = "CorruptionPerceptionIndex2015"

const transitionDuration = 1000

// // Create Graticule
// const graticuleG = svg.append('g')
//     .attr('class', 'graticule')

// const graticule = d3.geoGraticule()
//     .step([12, 12])

// var gratLines = graticuleG.selectAll(".gratLines")
//     .data(graticule.lines())
//     .enter()
//         .append("path")
//             .attr("class", "gratLines")
//             .attr("d", pathGenerator)

// var gratBackground = graticuleG.append("path")
//     .datum(graticule.outline())
//     .attr("class", "gratBackground")
//     .attr("d", pathGenerator)

// gratLines.exit().remove()

const colorScale = d3.scaleLinear()
    .range(['black', 'red'])

const colorScaleMoney = d3.scaleLinear()
    .range(['black', 'green'])

Promise.all([
    d3.json('data/worldMap50mSimplified.json', function(error, world) {
        if (error) return console.error(error)}),
    d3.csv('data/africaCorruptionData.csv', d => {
       d.CorruptionPerceptionIndex2015 = +d.CorruptionPerceptionIndex2015
       d.CorruptionControl2015 = +d.CorruptionControl2015
       d.IbrahimIndex2015 = +d.IbrahimIndex2015
       d.EaseOfDoingBusinessRank2015 = +d.EaseOfDoingBusinessRank2015
       d.NAIPerAdultDollars2017 = +d.NAIPerAdultDollars2017
       d.GDPPerAdultDollars2017 = +d.GDPPerAdultDollars2017
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
                if (feature.properties.ISO_A2 == stat.ISO2) {
                    feature.properties.CorruptionPerceptionIndex2015 = stat.CorruptionPerceptionIndex2015
                    feature.properties.CorruptionControl2015 = stat.CorruptionControl2015
                    feature.properties.IbrahimIndex2015 = stat.IbrahimIndex2015
                    feature.properties.EaseOfDoingBusinessRank2015 = stat.EaseOfDoingBusinessRank2015
                    feature.properties.NAIPerAdultDollars2017 = stat.NAIPerAdultDollars2017
                    feature.properties.GDPPerAdultDollars2017 = stat.GDPPerAdultDollars2017
                    break
                }
            }
            countryArray.push(feature)
        }
    }
    colorScale.domain(d3.extent(cData, d=>d.CorruptionPerceptionIndex2015))
    window.cData = cData // globalize
    window.countryArray = countryArray // globalize
    //console.log(cData)
    return countryArray

}

function createMap(countryArray) {
    countriesG
       .selectAll('path')
       .data(countryArray)
       .enter()
          .append('path')
             .attr('class', d => 'country ' + d.properties.ISO_A2)
            //  .attr('d', pathGenerator)
             .attr('d', cartogram.path)
             .style('fill', d => {
                if (d.properties.CorruptionPerceptionIndex2015) {
                   return colorScale(d.properties.CorruptionPerceptionIndex2015)
                }
             })
             .on("mousemove", moveToolTip)
             .on("mouseout", hideToolTip)

    return countryArray
 }

 function moveToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) {
       const cPFormat = d3.format(attributeMap.get(selectionIndicator).formatText)
       tooltip.html(`
          <p>${d.properties.ADMIN}<span class="number"> ${cPFormat(d.properties.CorruptionPerceptionIndex2015)}</span></p>
       `)
       tooltip.style('opacity', 1)
       let mouseX = d3.event.pageX
       const tooltipWidth = parseInt(tooltip.style('width'))
       if ((mouseX + tooltipWidth + 20) >= widthBody - 17) {
           mouseX = (widthBody - tooltipWidth - 20 - 17)
       }
       tooltip.style('left', (mouseX + 10) + 'px')
       tooltip.style('top', (d3.event.pageY + 20) + 'px')

       d3.selectAll("." + d.properties.ISO_A2)
          .style('stroke', '#fff')
          .style('stroke-width', '2.5')
          .raise()
    }
 }

 function hideToolTip(d) {
    if (d.properties.CorruptionPerceptionIndex2015) {
        tooltip.style('opacity', 0)
        d3.select(".country." + d.properties.ISO_A2)
            .style('stroke', 'white')
            .style('stroke-width', '1')
        d3.select(".bar." + d.properties.ISO_A2)
            .style('stroke-width', '0')
    }
 }

 d3.select('.infocard')
    .style('left', 0 + 'px')
    .style('height',100 + 'vh')
    .style('top', height/300 + 'px')
    .style('border-top-left-radius',0 + 'px')
    .style('border-top-right-radius',0 + 'px')
    .style('border-bottom-left-radius',0 + 'px')
    .style('width', 293 + 'px')
 d3.select('.card .card-header')
    .text(attributeMap.get(selectionIndicator).name)
    .style('font-weight', 700)
 d3.select('.card-text')
    .text(attributeMap.get(selectionIndicator).infoCardText)
 d3.select('.card .card-body a')
    .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
 d3.select('.sourceLink')
    .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)

function rerender(selectionIndicator) {
    const dataString = "d.properties." + selectionIndicator
    const cPFormat = d3.format(attributeMap.get(selectionIndicator).formatText)
    const tickFormat = d3.format(attributeMap.get(selectionIndicator).formatScale)
    if (attributeMap.get(selectionIndicator).formatText.includes('$')) {
        colorScaleMoney.domain(attributeMap.get(selectionIndicator).domainData)
        var moneyFlag = true
    } else {
        colorScale.domain(attributeMap.get(selectionIndicator).domainData)
        var moneyFlag = false
    }

    // Reset indicator text on nav bar
    d3.select("#navbarDropdownMenuLink")
        .text(attributeMap.get(selectionIndicator).name)

    // Change map fill and tooltip text upon indicator change
    d3.selectAll(".country")
        .on("mousemove", moveToolTip)
        .on("mouseout", hideToolTip)
        .transition()
            .duration(transitionDuration)
            .style("fill", d => {
                outColor = "#808080"
                if (eval(dataString)) {
                    if (moneyFlag) {
                        outColor = colorScaleMoney(eval(dataString))
                    } else {
                        outColor = colorScale(eval(dataString))
                    }
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

            d3.selectAll("." + d.properties.ISO_A2)
                .style('stroke', '#fff')
                .style('stroke-width', '2.5')
                .raise()
        }
    }

    function hideToolTip(d) {
        tooltip.style('opacity', 0)
        d3.select(".country." + d.properties.ISO_A2)
                .style('stroke', 'white')
                .style('stroke-width', '1')
        d3.select(".bar." + d.properties.ISO_A2)
            .style('stroke-width', '0')
        }




    d3.select('.card .card-header')
        .text(attributeMap.get(selectionIndicator).name)
    d3.select('.card-text')
        .text(attributeMap.get(selectionIndicator).infoCardText)
    d3.select('.card .card-body a')
        .attr("href", attributeMap.get(selectionIndicator).infoCardLinkURL)
    d3.select('.sourceLink')
        .text(attributeMap.get(selectionIndicator).infoCardLinkTitle)
}
