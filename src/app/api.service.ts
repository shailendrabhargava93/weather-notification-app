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
}
