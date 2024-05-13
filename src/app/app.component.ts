import { Component } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from './api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  placeForm: FormGroup;
  subscription: Subscription[] = [];

  location: any = null;
  weather: any = {};

  constructor(private fb: FormBuilder, private apiService: ApiService) {
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
      this.apiService.get(place).subscribe((data: any) => {
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
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Subscribed Successfully',
        showConfirmButton: false,
        width: '20rem',
        padding: '1rem',
        timer: 1500,
      });
    } else
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Enter city name',
        showConfirmButton: false,
        width: '20rem',
        padding: '1rem',
        timer: 1500,
      });
  }

  unsubscribeForNotification() {
    console.info('unsubscribed');
    this.subscription.forEach((s) => s.unsubscribe());
    localStorage.clear();
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Unsubscribed Successfully',
      showConfirmButton: false,
      width: '20rem',
      padding: '1rem',
      timer: 1500,
    });
  }

  getWeather() {
    let place = this.placeForm.get('city')?.value;
    if (place !== null && place !== '') {
      this.apiService.get(place).subscribe((data: any) => {
        console.log(data.current.condition);
        this.weather = data.current.condition;
        this.location = data.location.name + ', ' + data.location.region;
      });
    } else
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Enter city name',
        showConfirmButton: false,
        width: '20rem',
        padding: '1rem',
        timer: 1500,
      });
  }
}
