const { time } = require('console')
const express = require('express')
const app = express()
const fs = require('fs')
const path = require( 'path')


const port = 5000

app.use(express.static(__dirname + "/public"));

app.get('/api', (req, res) => {
    
    const photoPath = path.join(__dirname, '/public/photos')
    const bdPath = path.join(__dirname, 'birthdays.txt')
    const advPath = path.join(__dirname, 'adv.txt')
    const newsPath = path.join(__dirname, 'news.txt')
    const companyPath = path.join(__dirname, 'conf.txt')
    
    // функция добавления нуля чтобы время отображалось в формате "ЧЧ:ММ"
    const pad = d =>  (d < 10) ? '0' + d.toString() : d.toString()


    const companyName = fs.readFileSync(companyPath, 'utf-8')
    

    const bdContentArr = fs.readFileSync(bdPath, 'utf8')
        .split('\n')
        .map(element => { // мапим массив с днями рождениями в котором строка в виде "08.08.1900 Культурбаева Леонида Анатольевича"
            return {// преобразовываем в json чтобы потом запихать в страницу
                name: element.substring(14),
                date: `${element.substring(3, 5)}-${element.substring(0, 2)}`, 
                eventType: element.substring(11, 13)
            }
        })
    // console.log(bdContentArr)
    
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
    
    const newsFd = fs.openSync(newsPath)
    const newsAgeInMs = fs.fstatSync(newsFd).birthtime
    const newsAgeInHours = getAgeInHours(newsAgeInMs)
    fs.close(newsFd, (err) => {
        if (err)
          console.error('Failed to close file', err);
        else {
          console.log("\n> File Closed successfully");
        }
      });    


    // console.log('News after file reading: ', news)




    const getPhotoAge = (photoPath, fileNames) => {
        let minAge = 100 
        fileNames.map(fileNeme => {
            let photoFd = fs.openSync(`${photoPath}/${fileNeme}`)
            const birthtimeInMs = fs.fstatSync(photoFd).birthtime
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
    const photoFileNames = fs.readdirSync(photoPath)
    const minPhotoAge = getPhotoAge(photoPath, photoFileNames)
    // console.log("List of fileNames : ", photoFileNames)
    const slideShow = {
        age: minPhotoAge, 
        fileNames: photoFileNames
    }
    
    
    // console.log("Slide show is: ", slideShow)
    const isSlideShow = slideShow.age < 100
    const isBirthday = birthdaysForToday.length > 0
    const isAdvert = adv[0] === 'да\r'
    const isNews = false && newsAgeInHours < 48
    // console.log("Is the slide show supposed to be: ", isSlideShow)
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