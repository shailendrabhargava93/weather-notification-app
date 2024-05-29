import { Component } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'my-app',
  // templateUrl: './app.component.html',
  templateUrl: './weather-app.component.html',
  // styleUrls: ['./app.component.css'],
})
export class AppComponent {
  placeForm: FormGroup;
  subscription: Subscription[] = [];

  location: any = null;
  weather: any = {};
  forecastDays: any[] = [];
  isCelsius = false;
  isFahrenheit = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toast: HotToastService
  ) {
    this.placeForm = this.fb.group({
      city: [null, Validators.required],
    });

    let hour = 3600000;
    let ftnMinutes = 900000;
    this.subscription.push(
      interval(5000).subscribe((x) => {
        if (x) {
          this.sendNotification();
        }
      })
    );
  }
  sendNotification() {
    let place = localStorage.getItem('place');
    let subs = localStorage.getItem('subscribed');
    if (place !== null && place !== '' && subs === 'true') {
      this.apiService.getCurrent(place).subscribe((data: any) => {
        let weather = data.current.condition;
        let location = data.location.name + ', ' + data.location.region;
        if (Notification.permission === 'granted') {
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
    }
  }

  subscribeForNotification() {
    let place = this.placeForm.get('city')?.value;
    if (place != null && place != '') {
      localStorage.setItem('place', place);
      localStorage.setItem('subscribed', 'true');
      this.placeForm.get('city')?.setValue(null);
      this.toast.success('Subscribed Successfully 👍');
    } else this.toast.warning('You are not subscribed.');
  }

  unsubscribeForNotification() {
    console.info('unsubscribed');
    this.subscription.forEach((s) => s.unsubscribe());
    localStorage.clear();
    this.toast.success('Unsubscribed Successfully 👍');
  }

  getWeather() {
    let place = this.placeForm.get('city')?.value;
    if (place !== null && place !== '') {
      this.apiService
        .getCurrent(place)
        .pipe(
          this.toast.observe({
            loading: 'Fetching weather updates ⌛',
            success: 'Done ✅',
            error: 'Something failed',
          })
        )
        .subscribe((data: any) => {
          this.isCelsius = true;
          this.weather = data.current;
          this.location =
            data.location.name +
            ', ' +
            data.location.region +
            ', ' +
            data.location.country;
        });
    } else this.toast.warning('Enter city name 🏙️');
  }

  getForecast() {
    let place = this.placeForm.get('city')?.value;
    if (place !== null && place !== '') {
      this.apiService
        .getForecast(place)
        .pipe(
          this.toast.observe({
            loading: 'Fetching forecast updates ⌛',
            success: 'Done ✅',
            error: 'Something failed',
          })
        )
        .subscribe((data: any) => {
          this.location = data.location.name;
          this.forecastDays = data.forecast.forecastday;
          console.log(this.forecastDays);
        });
    } else this.toast.warning('Enter city name 🏙️');
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          if (position) {
            // Get the user's latitude and longitude coordinates
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const combined = lat + ',' + lng;
            console.log(`Coords : ${combined}`);
            this.placeForm.get('city')?.setValue(combined);
            this.getWeather();
          }
        },
        (error: GeolocationPositionError) => console.log(error)
      );
    } else {
      this.placeForm.get('city')?.setValue(null);
      this.toast.error('Geolocation is not supported by this browser.');
    }
  }

  onTab(tab: string) {
    if (tab === 'current-tab') {
      document.getElementById('current-content')?.classList.remove('hidden');
      document.getElementById('forecast-content')?.classList.add('hidden');
    } else {
      document.getElementById('current-content')?.classList.add('hidden');
      document.getElementById('forecast-content')?.classList.remove('hidden');
      this.getForecast();
    }
  }

  onUnitChange() {
    this.isCelsius = !this.isCelsius;
  }
}
