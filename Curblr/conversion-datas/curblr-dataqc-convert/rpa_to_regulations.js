// curblrizes a geojson output from sharedstreets-js
let jsonOutput=false;
if(process.argv[2]==="json"){
    jsonOutput=true;
}

function debug(...param){
    if(!jsonOutput){
        console.log(...param);
    }
}

const fs = require('fs');

const rpaCodeJson = fs.readFileSync('data/signalisation-codification-rpa.json');
const rpaCodes = JSON.parse(rpaCodeJson);

/* TODO fix
2445 livraison et non seulement \p
14228  max 15 min
1425  max 60 min
*/


const overide = { 11: [{priority:4,rule:{activity:"no standing"}, timeSpans:[] }],
    95: [{ priority: 3, rule:{activity:"standing"}, timeSpans:[{daysOfWeek:{days:["mo","tu","we","th","fr"]},timesOfDay:[{from:"08:00",to:"09:30"}]},{daysOfWeek:{days:["mo","tu","we","th","fr"]},timesOfDay:[{from:"15:30",to:"18:00"}]}]}],
    2413: [{priority:4,rule:{activity:"no parking"}, timeSpans:[] }],
    2414: [{priority:4,rule:{activity:"no parking"}, timeSpans:[] }],
    2348: [{priority:4,rule:{activity:"no parking"}, timeSpans:[], userClasses:[{classes:["truck"]}]}],
    13810: [{priority:3,rule:{activity:"no parking"}, timeSpans:[{"effectiveDates":[{"from":"04-01","to":"12-01"}],"daysOfWeek":{"days":["mo","th"]},"timesOfDay":[{"from":"09:00","to":"12:00"}]}], userClasses:[{classes:["truck"]}]}]
}
// const overide = 

// {
//    11: [
//       {
//          priority: 4,
//          rule: {
//             activity: "no standing"
//          },
//          timeSpans: []
//       }
//    ],
//    95: [
//       {
//          priority: 3,
//          rule: {
//             activity: "standing"
//          },
//          timeSpans: [
//             {
//                daysOfWeek: {
//                   days: [
//                      "mo",
//                      "tu",
//                      "we",
//                      "th",
//                      "fr"
//                   ]
//                },
//                timesOfDay: [
//                   {
//                      from: "08:00",
//                      to: "09:30"
//                   }
//                ]
//             },
//             {
//                daysOfWeek: {
//                   days: [
//                      "mo",
//                      "tu",
//                      "we",
//                      "th",
//                      "fr"
//                   ]
//                },
//                timesOfDay: [
//                   {
//                      from: "15:30",
//                      to: "18:00"
//                   }
//                ]
//             }
//          ]
//       }
//    ],
//    2413: [
//       {
//          priority: 4,
//          rule: {
//             activity: "no parking"
//          },
//          timeSpans: []
//       }
//    ],
//    2414: [
//       {
//          priority: 4,
//          rule: {
//             activity: "no parking"
//          },
//          timeSpans: []
//       }
//    ],
//    2348: [
//       {
//          priority: 4,
//          rule: {
//             activity: "no parking"
//          },
//          timeSpans: [],
//          userClasses: [
//             {
//                classes: [
//                   truck
//                ]
//             }
//          ]
//       }
//    ],
//    13810: [
//       {
//          priority: 3,
//          rule: {
//             activity: "no parking"
//          },
//          timeSpans: [
//             {
//                effectiveDates: [
//                   {
//                      from: "04-01",
//                      to: "12-01"
//                   }
//                ],
//                daysOfWeek: {
//                   days: [
//                      "mo",
//                      "th"
//                   ]
//                },
//                timesOfDay: [
//                   {
//                      from: "09:00",
//                      to: "12:00"
//                   }
//                ]
//             }
//          ],
//          userClasses: [
//             {
//                classes: [
//                   "truck"
//                ]
//             }
//          ]
//       }
//    ]
// }




for (var rpaCode of rpaCodes) {
    if(overide[rpaCode.ID]){
        rpaCode['regulations'] = [{
            priority: 5,
            rule:{
                activity: "parking"
            },
            timeSpans: []
        },...overide[rpaCode.ID]
        ];
        continue;
    }
    if (rpaCode.DESCRIPTION != ""){
        description = rpaCode.DESCRIPTION.toUpperCase();
        let activity = '';
    }
    if(description.includes("\\P ") || description.startsWith("STAT. INT. ")) {
        activity = 'no parking';
    } else if(description.includes("\\A ")) {
        activity = 'no standing';
    } else if(description.startsWith("STAT. ") || description.startsWith("AIRE DE ")) {
        activity = 'parking';
    }

    else if(description.startsWith("PANONCEAU ") || description.startsWith("PANNONCEAU")) {
        activity = null;
    } else {
        continue;
        //debug(`${rpaCode.CODE_RPA} ${description}`)
    }
    let userClasses;
    if(description.includes("PERMIS")){
        activity = 'restricted';
        userClasses = [
            {
                "classes": ["permit"]
            }
        ];
    }

    if (rpaCode.DESCRIPTION != ""){
        description = rpaCode.DESCRIPTION.toUpperCase();
        let fleche_pan = '';
    }
    if(description.includes("DR")) {
        fleche_pan = 'right';
    } else if(description.includes("GA")) {
        fleche_pan = 'left';
    } else if(description.includes("DOU")) {
        fleche_pan = 'double';
    } else if(description.includes("TOUT")) {
        fleche_pan = 'straight';
    } else {
        continue;
        debug(`${rpaCode.ID} ${description}`)
    }

    let timeSpans = [];
    let timeSpan = {};

    //   ********** months

    monthValues = { "1 MARS AU 1 DEC":[{"from":"03-01","to":"12-01"}],
        "1ER MARS 1ER DEC":[{"from":"03-01","to":"12-01"}],
        "1ER MARS - 1ER DÉC":[{"from":"03-01","to":"12-01"}],
        "1ER MARS - 1ER  DÉC":[{"from":"03-01","to":"12-01"}],
        "1ER MARS AU 1ER DECEMBRE":[{"from":"03-01","to":"12-01"}],
        "1ER MARS AU 1ER DEC":[{"from":"03-01","to":"12-01"}],
        "MARS 01 A DEC. 01":[{"from":"03-01","to":"12-01"}],
        "1 MARSL AU 1 DEC":[{"from":"03-01","to":"12-01"}],
        "1MARS AU 1 DEC.":[{"from":"03-01","to":"12-01"}],
        "15 MARS AU 15 NOV":[{"from":"03-15","to":"11-15"}],
        "15 MARS AU 15 NOVEMBRE":[{"from":"03-15","to":"11-15"}],
        "1 AVRIL AU 30 SEPT":[{"from":"04-01","to":"09-30"}],
        "1 AVRIL AU 15 OCT":[{"from":"05-01","to":"10-15"}],
        "1 AVRIL AU 31 OCT":[{"from":"05-01","to":"10-31"}],
        "1 AVRIL AU 1 NOVEMBRE":[{"from":"05-01","to":"11-01"}],
        "1 AVRIL AU 15 NOV":[{"from":"05-01","to":"11-15"}],
        "1 AVRIL AU 15 NOVEMBRE":[{"from":"05-01","to":"11-15"}],
        "1 AVRIL AU 30 NOV":[{"from":"04-01","to":"11-30"}],
        "1ER AVRIL - 30 NOV":[{"from":"04-01","to":"11-30"}],
        "1 AVRIL AU 1 DEC":[{"from":"04-01","to":"12-01"}],
        "1 AVIL AU 1 DEC":[{"from":"04-01","to":"12-01"}],
        "1 AVRIL ET 1 DEC":[{"from":"04-01","to":"12-01"}],
        "1AVRIL AU 1 DEC":[{"from":"04-01","to":"12-01"}],
        "1AVRIL AU 1DEC":[{"from":"04-01","to":"12-01"}],
        "1ER AVRIL AU 1ER DEC":[{"from":"04-01","to":"12-01"}],
        "1ER AVRIL AU 30 NOV":[{"from":"04-01","to":"12-01"}],
        "1ER AVRIL AU 14 NOV":[{"from":"04-01","to":"12-01"}],
        "AVRIL 01 A DEC. 01":[{"from":"04-01","to":"12-01"}],
        "1 AVRILS AU 1 DEC":[{"from":"04-01","to":"12-01"}],
        "1 AVRIL  AU 1 DEC":[{"from":"04-01","to":"12-01"}],
        "15 AVRIL AU 15 OCTOBRE":[{"from":"04-15","to":"10-15"}],
        "15 AVRIL AU 1 NOV":[{"from":"05-15","to":"11-01"}],
        "15 AVRIL AU 1ER NOV.":[{"from":"04-15","to":"11-01"}],
        "15 AVRIL AU 1 NOVEMBRE":[{"from":"04-15","to":"11-01"}],
        "15 AVRIL AU 15 NOVEMBRE":[{"from":"04-15","to":"11-15"}],
        "15 AVRIL AU 1ER DEC":[{"from":"05-15","to":"12-01"}],
        "1MAI AU 1 SEPT":[{"from":"05-01","to":"09-01"}],
        "1 MAI AU 30 SEPT":[{"from":"05-01","to":"09-30"}],
        "1ER  MAI AU 31 OCT":[{"from":"05-01","to":"10-01"}],
        "1ER MAI AU 1ER OCT":[{"from":"05-01","to":"10-01"}],
        "DIMANCHE 1ER MAI AU 30 SEPT":[{"from":"05-01","to":"09-30"}],
        "1MAI AU 1OCT":[{"from":"05-01","to":"10-01"}],
        "1ER MAI AU 1ER NOV":[{"from":"05-01","to":"11-01"}],
        "1 MAI AU 1 NOV":[{"from":"06-01","to":"11-01"}],
        "15 MAI AU 15 OCT":[{"from":"05-15","to":"10-15"}],
        "15 MAI AU 15 SEPT":[{"from":"05-15","to":"09-15"}],
        "1 JUIN AU 1 OCT":[{"from":"06-01","to":"10-01"}],
        "21 JUIN AU 1 SEPT":[{"from":"06-21","to":"09-01"}],
        "30 JUIN AU 30 AOUT":[{"from":"06-30","to":"08-30"}],
        "15 AOUT - 28 JUIN":[{"from":"08-15","to":"06-28"}],
        "20 AOÛT AU 30 JUIN":[{"from":"08-20","to":"06-30"}],
        "1 SEPT. AU 23 JUIN":[{"from":"09-01","to":"06-23"}],
        "SEPT A JUIN":[{"from":"09-01","to":"06-30"}],
        "SEPT À JUIN":[{"from":"09-01","to":"06-30"}],
        "SEPT. A JUIN":[{"from":"09-01","to":"06-30"}],
        "1 SEPT. AU 30 JUIN":[{"from":"09-01","to":"06-30"}],
        "1 SEPT. AU 31 MAI":[{"from":"09-01","to":"05-31"}],
        "1 NOV. AU 31 MARS":[{"from":"11-01","to":"03-31"}],
        "1ER NOV AU 1ER AVRIL":[{"from":"11-01","to":"04-01"}],
        "LUN-MER-VEN 15 NOV AU 15 AVRIL":[{"from":"11-15","to":"04-15"}],
        "LUN-MER-VEN-DIM 15 NOV. AU 31 MARS":[{"from":"11-15","to":"03-31"}],
        "MAR-JEU-SAM 15 NOV. AU 31 MARS":[{"from":"11-15","to":"03-31"}],
        "1 NOV. AU 1 AVRIL":[{"from":"11-01","to":"04-01"}],
        "1 NOVEMBRE AU 15 AVRIL":[{"from":"11-01","to":"04-15"}],
        "1 NOV. AU 1 MAI":[{"from":"11-01","to":"05-01"}],
        "15 NOV. AU 15 MARS":[{"from":"11-15","to":"03-15"}],
        "15 NOV. AU 1 AVRIL":[{"from":"11-15","to":"04-01"}],
        "15 NOV AU 31 MARS":[{"from":"11-15","to":"03-31"}],
        "LUN-MER-VEN 15 NOV AU 31MARS":[{"from":"11-15","to":"03-31"}],
        "30 NOV - 1ER AVRIL":[{"from":"11-30","to":"04-01"}],
        "1 DEC. AU 1 MARS":[{"from":"12-01","to":"03-01"}],
        "1ER DECEMBRE AU 1ER MARS":[{"from":"12-01","to":"03-01"}],
        "30 MIN 15 NOV. AU 31 MARS":[{"from":"11-15","to":"03-31"}],
        "1 DEC. AU 1 AVRIL":[{"from":"12-01","to":"04-01"}]}

    months = Object.entries(monthValues).reduce((ret,val)=>description.includes(val[0])?val[1]:ret,null)
    if(months){
        timeSpan["effectiveDates"] = months;
    }

    if(/.*(JAN|FEV|AVR|MARS|JUI|AOUT|SEP|OCT|NOV|DEC).*/.exec(description) && !months){
        console.error("months rules unknown",rpaCode.TYPE_CODE, description);
    }

    //   ********** days
    days = [];
    dayValues = { "mo":["LUNDI","LUN\\.","LUN"],
        "tu":["MARDI","MAR\\.","MAR"],
        "we":["MERCREDI","MER\\.","MER"],
        "th":["JEUDI","JEU\\.","JEU"],
        "fr":["VENDREDI","VEN\\.","VEN","VEMDREDI"],
        "sa":["SAMEDI","SAM\\.","SAM"],
        'su':["DIMANCHE","DIM\\.","DIM"]}
    dayMap = Object.entries(dayValues).reduce((acc,val)=>{
        const [key, value] = val;
        value.forEach(val2=>acc[val2.replace("\\","")]=key);
        return acc;
    },{})
    dayText = Object.values(dayValues).flat().join('|')

    threeDaysRegex = new RegExp(`(${dayText})\\s(${dayText})\\s(${dayText})`);
    threeDaysRule=threeDaysRegex.exec(description);

    if(threeDaysRule){
        days.push(dayMap[threeDaysRule[1]]);
        days.push(dayMap[threeDaysRule[2]]);
        days.push(dayMap[threeDaysRule[3]]);

    } else {
        daysRegex  = new RegExp(`(${dayText})(\\s?\\S*\\s)(${dayText})`);
        daysRule=daysRegex.exec(description);

        if(daysRule){
            if(/.*(A|À|AU).*/.exec(daysRule[2])){
                daysAbbr=Object.keys(dayValues);

                days=daysAbbr.slice(daysAbbr.findIndex(val=>val===dayMap[daysRule[1]]),daysAbbr.findIndex(val=>val===dayMap[daysRule[3]])+1)
            } else if(/(ET|\s)/.exec(daysRule[2])){
                days.push(dayMap[daysRule[1]]);
                days.push(dayMap[daysRule[3]]);
            } else {
                console.error("day rules verbe unknown",daysRule[2], rpaCode.TYPE_CODE, description);
            }
        } else {
            dayRegex  = new RegExp(`(${dayText})`);
            dayRule=dayRegex.exec(description);
            if(dayRule){
                days.push(dayMap[dayRule[1]]);
            }
        }
    }
    if(days.length){
        timeSpan["daysOfWeek"] = {days};
    }


    //   ********** time
    timeRegexp=/(\d+[H]\d*)\s?[Aaà@-]\s?(\d+[H]\d*)/g;

    if(time = timeRegexp.exec(description)){
        do{
            const convertHtime = (time) => {
                [h,m] = time.split("H")
                if(!m){
                    m="00"
                }
                return `${h.padStart(2,'0')}:${m}`
            }
            if(time){
                startTime = convertHtime(time[1]);
                endTime = convertHtime(time[2]);
                //debug(`${startTime}-${endTime} ${description}`)
            }else{
                //debug(`${description}`)
            }

            if(startTime && endTime) {
                timeSpan['timesOfDay'] = [{
                    from: startTime,
                    to: endTime
                }]
            }

            if(Object.keys(timeSpan).length){
                timeSpans.push({...timeSpan});
            }
        } while(time = timeRegexp.exec(description))
    } else {
        if(Object.keys(timeSpan).length){
            timeSpans.push({...timeSpan});
        }
    }

    let priority = timeSpans.length>0?3:4;
    
    ///duration
    var reg = /[0-9]* MIN/g;
    let extract = reg.exec(description);
    let maxStay;
    if (extract != '0' && extract != null){
        maxStay = parseInt(extract[0].slice(0, -4))
    }
    ////
    if(activity){
        rpaCode['regulations'] = [{
            // priority,
            rule:{
                activity,
                priority,
                fleche_pan,
                maxStay///duration
            },
            timeSpans,
            userClasses
        }];
    } else if(timeSpans.length>0){
        rpaCode['regulations'] = [{
            timeSpans
        }];
    }
    debug(`${rpaCode.TYPE_CODE.padEnd(11)} ${description.padEnd(55)} ${daysRule||dayRule} ${JSON.stringify(timeSpans)}`)
}
if(jsonOutput){
    console.log(JSON.stringify(rpaCodes, null, 2))
}