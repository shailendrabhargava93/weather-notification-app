import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private SERVER_URL =
    'https://api.weatherapi.com/v1/current.json?key=550d160d3f824008b6380038210805';

  constructor(private httpClient: HttpClient) {}

  public get(place: any) {
    //localStorage.setItem('place', place);
    return this.httpClient.get(this.SERVER_URL + '&q=' + place + '&aqi=yes');
  }

  public sendNotification() {
    let place = localStorage.getItem('place');
    let subs = localStorage.getItem('subscribed');
    if (place && subs == 'true') {
       this.httpClient
        .get(this.SERVER_URL + '&q=' + place + '&aqi=yes')
        .subscribe((data: any) => {
          let weather = data.current.condition;
          let location = data.location.name + ', ' + data.location.region;
          if (Notification.permission === 'granted') {
            //alert("we have permission");
            const notification = new Notification('Weather Notification', {
              body: weather.text + ' in ' + location,
              icon: weather.icon,
              badge: weather.icon,
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
              console.log(permission);
              const notification = new Notification('Weather Notification', {
                body: weather.text + ' in ' + location,
                icon: weather.icon,
                badge: weather.icon,
              });
            });
          }
        });
    } else console.error('No place provided');
  }
}
