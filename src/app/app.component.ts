import { Component } from '@angular/core';
import { interval } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from './api.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  location: any = null;
  weather: any = {};
  constructor(private apiService: ApiService) {
    let hour = 3600000;
    let ftnMinutes = 900000;
    interval(ftnMinutes).subscribe((x) => {
      this.apiService.sendNotification();
    });
  }

  subscribeForNotification() {
    let place = document.getElementById('place')['value'];
    if (place != null && place != '') {
      localStorage.setItem('place', place);
      localStorage.setItem('subscribed', 'true');
      document.getElementById('place')['value'] = '';
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
    let place = document.getElementById('place')['value'];
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
