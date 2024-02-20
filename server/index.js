const calendar = require('./calendar.json')
const { time } = require('console')
const express = require('express')
const app = express()
const fs = require('fs')
const path = require( 'path')


const port = 5000;
const date = new Date();
const conf = {
    newsAgeInHours : 24 * 5, 
    showBdUntill : 13, 
    slideShowAge : 100, 
    advAge : 10
}

app.use(express.static(__dirname + "/public"));

app.get('/api', (req, res) => {
    
    const photoPath = path.join(__dirname, '/public/photos')
    const newsPhotoPath = path.join(__dirname, '/public/newsphoto')
    const bdPath = path.join(__dirname, 'birthdays.txt')
    const advPath = path.join(__dirname, 'adv.txt')
    const newsPath = path.join(__dirname, 'news.txt')
    const companyPath = path.join(__dirname, 'conf.txt')
    
    
    const getPhotoAge = (photoPath, fileNames) => {
        let minAge = 100 
        fileNames.map(fileNeme => {
            let photoFd = fs.openSync(`${photoPath}/${fileNeme}`)
            const birthtimeInMs = fs.fstatSync(photoFd).birthtime < fs.fstatSync(photoFd).mtime ? fs.fstatSync(photoFd).mtime : fs.fstatSync(photoFd).birthtime
            // console.log(birthtimeInMs)
            fs.close(photoFd, (err) => {
                if (err)
                  console.error('Failed to close file', err);
                else {
                  console.log("\n> File Closed successfully");
                }
              });  
            let hours = getAgeInHours(birthtimeInMs)
            if(minAge > hours) {
                minAge = hours
            } 
        })
        return minAge
    }

    const newsPhotoFilesNames = fs.readdirSync(newsPhotoPath);

    // функция добавления нуля чтобы время отображалось в формате "ЧЧ:ММ"
    const pad = d =>  (d < 10) ? '0' + d.toString() : d.toString()


    const companyName = fs.readFileSync(companyPath, 'utf-8')
    
    

    const bdContentArr = fs.readFileSync(bdPath, 'utf-8')
        .split('\n')
        .map(element => { // мапим массив с днями рождениями в котором строка в виде "08.08.1900 bd Культурбаева Леонида Анатольевича"
            // console.log("Split element in bd array: ", element);
            return {// преобразовываем в json чтобы потом запихать в страницу
                name: element.substring(14),
                date: `${element.substring(3, 5)}-${element.substring(0, 2)}`, 
                eventType: element.substring(11, 13)
            }
        })
        .map(element => { // если день попадает на выходной, то переносим его
            const year = new Date().getFullYear();
            const month = element.date.substring(0, 2);
            const day = element.date.substring(3, 5);
            let date = new Date(year, month - 1, day);
            const weekDay = date.getDay()
            switch (weekDay) {
                case 6:
                    date = new Date(date.getTime() + 1000 * 60 * 60 * 24 * 2);
                    break;
                case 0: 
                    date = new Date(date.getTime() + 1000 * 60 * 60 * 24);
                default:
                    break;
            }
            
            const newDay = ("0" + date.getDate()).slice(-2);
            const newMonth = ("0" + (1 + date.getMonth())).slice(-2);
            console.log("Resceduing: month - ", month, " day - ", day, "weekday: ", weekDay, " Rescedued month - ", newMonth, " day - ", newDay);
            // console.log("day month check: ", element.date, "month: ", month, "day: ", day);
            const checkMatch = (calendar, day, month) => {
                // console.log("month in checkMatch: ", month)
                const year = new Date().getFullYear();
                const match = calendar.months[month - 1]
                    .days
                    .split(',')
                    .map(element => {
                        if(element.includes("+")) return element.substring(0, element.length - 1)
                        return element
                    })
                    .map(element => {
                        if(element.includes("*")) return '';
                        return element
                    })
                    .filter(element => parseInt(day) === parseInt(element))
                return match
            }  
            // const resceduleOneDay = (calendar, day, month, checkMatch) => {
            //     const year = new Date().getFullYear();
            //     const date = new Date(year, month, day);
            //     if(checkMatch(calendar, day, month).length > 0) {


            //         resceduleOneDay(calendar, day, month)
            //         return new Date(date.getTime() + 1000 * 60 * 60 * 24)
            //     }
            //     return date
            // }

            // if(!resceduleOneDay(calendar, day, month, checkMatch)) {
            //     return {// преобразовываем в json чтобы потом запихать в страницу
            //         name: element.name,
            //         date: element.date, 
            //         eventType: element.eventType
            //     }
            // }


            console.log("date match check: ", `${newMonth}-${newDay}`, "match", checkMatch(calendar, day, month));
            
            return {// преобразовываем в json чтобы потом запихать в страницу
                name: element.name,
                date: `${newMonth}-${newDay}`, 
                eventType: element.eventType
            }
            
        })
    // console.log("calendar: ", calendar);
    // console.log("bdContentArr: ", bdContentArr);
    
    const birthdaysForToday = bdContentArr.filter(element => { // массив дней рождений на сегодня
        const d = new Date()
        return element.date === `${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    })
    // console.log(birthdaysForToday)

    const adv = fs.readFileSync(advPath, 'utf8')
        .split('\n')

    const getAgeInHours = ms => {
        const d = new Date()
        const createHours = Math.floor(ms  / 3600000);
        // console.log("Create in hours: ", createHours)
        const nowHours = Math.floor(d / 3600000);                    
        // console.log("Now in hours: ", nowHours)
        return nowHours - createHours
    }
    

    const newsArr = fs.readFileSync(newsPath, 'utf-8')
        .split('\n')
    
    const news = []

    for (let i=0; i < newsArr.length; i++) {
        if(newsArr[i][0] != '#') {
            news.push({
                title: newsArr[i], 
                body: newsArr[i + 1]
            })
            i++
        }   
    }
    
    // const newsFd = fs.openSync(newsPath)
    // const newsAgeInMs = fs.fstatSync(newsFd).birthtime
    const newsAgeInHours = getPhotoAge(newsPhotoPath, newsPhotoFilesNames);
    const advAge = getPhotoAge(advPath, ['']);
    const photoFileNames = fs.readdirSync(photoPath)
    
    const minPhotoAge = getPhotoAge(photoPath, photoFileNames)
    // console.log("List of fileNames : ", photoFileNames)
    const slideShow = {
        age: minPhotoAge, 
        fileNames: photoFileNames
    }
    
    
    // console.log("Slide show is: ", slideShow);
    // console.log('Age of news: ', newsAgeInHours);
    const isSlideShow = slideShow.age < conf.slideShowAge;
    const isBirthday = (birthdaysForToday.length > 0) && (conf.showBdUntill >= date.getHours());
    const isAdvert = adv[0].includes('да') && advAge < conf.advAge;
    const isNews = newsAgeInHours < conf.newsAgeInHours;
    // console.log('isNews: ', isNews);
    // console.log("Is the slide show supposed to be: ", isSlideShow);
    // console.log("adv array: ", adv);
    
    // Режимы работы:
    if(isAdvert) {            // Объявления
        // console.log("Advert : ", adv)
        const result = {
            companyName, 
            slides: [{
                url: "adv.jpg", 
                title: adv[1],
                body: ""
            }]
        }
        console.log(result)
        res.json(result)
    } else if(isBirthday) {   // ДР / Праздники
        // console.log("BD / event : ", birthdaysForToday)
        const result = {
            companyName, 
            slides: birthdaysForToday.map(element => {
                return {
                    url: `${element.eventType}.jpg`, 
                    title: element.name,
                    body: ""
                }
            })
        }
        console.log(result)
        res.json(result)
    } else if(isSlideShow) { // Слайдшоу
        // console.log("Slideshow array in get request : ", slideShow)
        const result = {
            companyName,
            slides: slideShow.fileNames.map(slide => {
                return {
                    url: `photos/${slide}`, 
                    title: "",
                    body: "Режим слайдшоу"
                }
            })
        }
        console.log(result)
        res.json(result)
    }  
    else if(isNews) {        // Новости
        const result = { 
                companyName,
                slides: news.map((article, index) => {
                    return {
                        url: `newsphoto/${index}.jpg`, 
                        title: article.title,
                        body: article.body
                    }
                })
            }
        console.log(result)
        res.json(result)
    } else { // Заставка
        const result = {
            companyName,
            slides: [
                {
                    url: `wallpapper.jpg`, 
                    title: " ",
                    body: " " 
                }
            ]
        }
        console.log(result)
        res.json(result)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
