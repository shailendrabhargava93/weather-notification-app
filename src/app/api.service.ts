import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private SERVER_URL =
    'https://api.weatherapi.com/v1/current.json?key=550d160d3f824008b6380038210805';

  private FORECAST_URL =
    'https://api.weatherapi.com/v1/forecast.json?key=550d160d3f824008b6380038210805&days=4';

  constructor(private httpClient: HttpClient) {}

  public getCurrent(place: any) {
    return this.httpClient.get(this.SERVER_URL + '&q=' + place);
  }

  public getForecast(place: any) {
    return this.httpClient.get(this.FORECAST_URL + '&q=' + place);
  }
}
