import { Component, HostListener } from "@angular/core";
import { interval, Subscription } from "rxjs";
import { ApiService } from "./api.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";

@Component({
  selector: "my-app",
  // templateUrl: './app.component.html',
  templateUrl: "./weather-app.component.html",
  styleUrls: ["./weather-app.component.css"],
})
export class AppComponent {
  placeForm: FormGroup;
  subscription: Subscription[] = [];

  location: any = null;
  weather: any = {};
  forecastDays: any[] = [];
  isCelsius = false;
  isFahrenheit = false;
  isCurrentTab = false;

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
    let place = localStorage.getItem("place");
    let subs = localStorage.getItem("subscribed");
    if (place !== null && place !== "" && subs === "true") {
      this.apiService.getCurrent(place).subscribe((data: any) => {
        let weather = data.current.condition;
        let location = data.location.name + ", " + data.location.region;
        if (Notification.permission === "granted") {
          const notification = new Notification("Weather Notification", {
            body: weather.text + " in " + location,
            icon: weather.icon,
            badge: weather.icon,
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            console.log(permission);
            const notification = new Notification("Weather Notification", {
              body: weather.text + " in " + location,
              icon: weather.icon,
              badge: weather.icon,
            });
          });
        }
      });
    }
  }

  subscribeForNotification() {
    let place = this.placeForm.get("city")?.value;
    if (place != null && place != "") {
      localStorage.setItem("place", place);
      localStorage.setItem("subscribed", "true");
      this.placeForm.get("city")?.setValue(null);
      this.toast.success("You have subscribed to weather updates 👍");
    } else this.toast.warning("You have not subscribe to weather updates");
  }

  unsubscribeForNotification() {
    console.info("unsubscribed");
    this.subscription.forEach((s) => s.unsubscribe());
    localStorage.clear();
    this.toast.success("Unsubscribed Successfully 👍");
  }

  getWeather() {
    let place = this.placeForm.get("city")?.value;
    if (place !== null && place !== "") {
      this.apiService
        .getCurrent(place)
        .pipe(
          this.toast.observe({
            loading: "Fetching weather updates ⌛",
            success: "Done!",
            error: (e) => e.error.error.message,
          })
        )
        .subscribe((data: any) => {
          this.onTab("current-tab");
          this.isCelsius = true;
          this.weather = data.current;
          this.location =
            data.location.name +
            ", " +
            data.location.region +
            ", " +
            data.location.country;
        });
    } else this.toast.warning("Enter city name 🏙️");
  }

  getForecast() {
    let place = this.placeForm.get("city")?.value;
    if (place !== null && place !== "") {
      this.apiService
        .getForecast(place)
        .pipe(
          this.toast.observe({
            loading: "Fetching forecast updates ⌛",
            success: "Done!",
            error: (e) => e.error.error.message,
          })
        )
        .subscribe((data: any) => {
          this.location = data.location.name;
          this.forecastDays = data.forecast.forecastday;
        });
    } else this.toast.warning("Enter city name 🏙️");
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          if (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const combined = lat + "," + lng;
            this.placeForm.get("city")?.setValue(combined);
            this.getWeather();
          }
        },
        (error: GeolocationPositionError) => console.log(error)
      );
    } else {
      this.placeForm.get("city")?.setValue(null);
      this.toast.error("Geolocation is not supported by your current browser.");
    }
  }

  onTab(tab: string) {
    if (tab === "current-tab") {
      this.isCurrentTab = true;
    } else {
      this.isCurrentTab = false;
      this.getForecast();
    }
  }

  onUnitChange() {
    this.isCelsius = !this.isCelsius;
  }

  deferredPrompt: any;
  showButton = false;

  @HostListener("window:beforeinstallprompt", ["$event"])
  onbeforeinstallprompt(e: Event) {
    console.log(e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showButton = true;
  }

  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        this.toast.error("User dismissed the A2HS prompt");
      }
      this.deferredPrompt = null;
    });
  }
}
