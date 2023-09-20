import './BackgroundSlider.css'
import { useEffect, useState } from 'react'
import { ReactComponent as FSOLogo } from './fco_001.svg';

const BackgroundSlider = () => {
    const [ currentState, setCurrentState ] = useState(0)
    const [ clockBlinker, setClockBlinker ] = useState(true)
    const [ bgImageStyle, setBgImageStyle ] = useState(undefined)
    const [ backendData, setBackendData ] = useState({ 
        companyName: "Наименование",
        slides:
        [   
            {   url: '1.png', 
                title: 'Пожалуйста подождите.', 
                body: 'Идет инициализация'
            },
            {
                url: '2.png', 
                title: 'Пожалуйста подождите..', 
                body: 'Идет инициализация'
            },
            {
                url: '3.png', 
                title: 'Пожалуйста подождите...', 
                body: 'Идет инициализация'
            }
        ]
    })

    useEffect(() => {
        fetch("/api").then(
            response => response.json()
        ).then(
            data => setBackendData(data)
        )
    }, [])
    
    
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch("/api").then(
                response => response.json()
            ).then(
                data => setBackendData(data)
            )
        }, 24000)
        return () => clearTimeout(timer)
        
    }, [backendData])
        

    useEffect(()=> {
        const timer = setTimeout(() => {
            if(currentState === backendData.slides.length - 1){
                setCurrentState(0)
            } else {
                setCurrentState(currentState + 1)
            }
        }, 5000)
        return () => clearTimeout(timer)
    }, [currentState, backendData]) 

    useEffect(() => {
        const timer =setTimeout(() => {
            clockBlinker ? setClockBlinker(false) : setClockBlinker(true)
        }, 1000)
        return () => clearTimeout(timer)
    }, [clockBlinker])

    useEffect(() => {
        
        typeof backendData.slides !== 'undefined' &&
        // console.log(backendData.slides[currentState].url)
        setBgImageStyle({ 
            backgroundImage: `url(${backendData.slides[currentState].url})`, 
            backgroundPosition: 'center', 
            backgroundSize: 'cover', 
            height: '100%'})
    }, [backendData, currentState])

   
    
    const goToNext = (currentState) => {
        setCurrentState(currentState)
    }
    const getCurrentDate = () => {
        const monthes = ["января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря" ]
        const newDate = new Date()
        const date = newDate.getDate();
        const month = newDate.getMonth();
        const year = newDate.getFullYear();
        
        return `${date} ${monthes[month]} ${year} года`
        }
    const pad = (d) => { // функция добавления нуля чтобы время отображалось в формате "ЧЧ:ММ"
        return (d < 10) ? '0' + d.toString() : d.toString();
    }
    const getCurrentTime = () => {
        const d = new Date()
        return `${pad(d.getHours())}<blinker class="${clockBlinker ? 'hidden' : ''}">:</blinker>${pad(d.getMinutes())}`
    }
    console.log("Data fatched: ", backendData)
    return (
        <div className='countiner-style'>
            <div style={bgImageStyle}></div>
            <div className='description'>
                <FSOLogo className='fso-logo'/>
                <h1 className='fso-title'>{backendData.companyName}</h1>
                <h1 className='date'>{getCurrentDate()}</h1>
                <h1 className='time' dangerouslySetInnerHTML={{__html: getCurrentTime()}}/>
                <h1 className='dataTitle'>{backendData.slides[currentState].title}</h1>
                <p className='dataBody'>{backendData.slides[currentState].body}</p>
                <div className='carousel-boullt'>
                    {backendData.slides.map((element, index) => <span style={index === currentState ? {backgroundColor: "white"} : {}} key={index} onClick={() => goToNext(index)}></span>)}
                </div>
            </div>
        </div>   
    )
} 

export default BackgroundSlider