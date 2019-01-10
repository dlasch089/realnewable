# realnewable
This app calculates the momentum of electricy consumption for German households. It is part of an open source project, developed in the scope of a master thesis at the Technical University of Munich. The momentum is defined as the hour with the highest share of renewable energy sources in the network. The user can choose its location based on the federal states of Germany. Historical data was used to model the capacity distribution. 

The app uses the realnewable API as data source, which uses the official API of the EU ([ENTSO-E](https://www.entsoe.eu/data/)): 

URL: https://realnewable-server.herokuapp.com
Git repository: https://github.com/dlasch089/realnewable-server

**Note: both apps are currently running on a free plan of heroku and will therefore take some time to restart the server at the first call.**

Everybody is invited to contribute in the project.

For further questions, please contact: d.lasch@tum.de

# Technical Details

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.5.

## Development server

1. Fork the git and `cd /tum-realnewable`
2. Run `npm install`
3. Run `ng serve --aot` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

**Note: for impeccable usage of the local dev server, you also need to run the realnewable-server locally or change the base-url in the energyDataService. Do not forget to adjust the CLIENT_URL in the server you are using**

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

