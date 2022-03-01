import TelegramBot from 'node-telegram-bot-api';
import request from 'request';
import dotenv from 'dotenv';
dotenv.config();

const { TOKEN, WEATHER_APP_ID }= process.env;
const bot = new TelegramBot(TOKEN , { polling:true});

bot.on('polling_error' , (err) => console.log(err));
bot.onText(/\/city (.+)/ , (msg , match)=> {
  const chatId = msg.chat.id;
  const city = match[1];
  const query =
  'http://api.openweathermap.org/data/2.5/weather?q='
          + city + `&appid=${WEATHER_APP_ID}`;
  console.log(JSON.stringify(match));
  // Fetch weather data about entered city
  request(query , function (error , response , body) {
     if(!error && response.statusCode === 200) {
       bot.sendMessage(chatId , 
            'Looking for details of ' +city +' ...',
            {parse_mode:"Markdown"})
        
       const res = JSON.parse(body);
       // Kelvin to celsius and then round

       const temperature = Math.round(parseInt((res.main.temp_min) - 273.15 ),2);

       // Convert pressure to atm
       const pressure = Math.round(parseInt((res.main.pressure) - 1013.15),2);
      
       // Sun rise --> Unix time to IST time conversion
       const sunRise = new Date(parseInt(res.sys.sunrise) * 1000);

       // Sun set -->  Unix time to IST time conversion
       const sunSet = new Date(parseInt(res.sys.sunset) * 1000);

      // Geographic coordinate
       const coordinate = {
          longitude: res.coord.lon,
          latitude:res.coord.lat
       }
       bot.sendMessage(chatId , '*****'
            +res.name + '*****\nGeografik koordinatalari: '+
            String(coordinate.latitude) + ' shim keng '+
            String(coordinate.longitude)+ ' shq uz' + '\nTemperature: '+
            String(temperature) + ' °C\nHavo namligi: '+
            res.main.humidity + ' %\nWeather: ' +
            res.weather[0].description +'\nShamol tezligi: '+
            res.wind.speed + ' km/h \nHavo bosimi: '+
            String(pressure) +' atm \nQuyosh chiqishi: '+
            sunRise.toLocaleTimeString() + '\nQuyosh botishi: '+
            sunSet.toLocaleTimeString() + '\nCountry: '+
            res.sys.country
       );
     }     
     else {
        bot.sendMessage(chatId , response.statusCode)
        bot.sendMessage(chatId , city);
     }
  })
})