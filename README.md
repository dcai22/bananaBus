# BANANA BUS 🚌 INSTALLATION MANUAL
## Installing prebuilt APK
The simplest way to run the app for yourself is by installing a prebuilt binary on an android device/emulator. This will use the backend we have hosted on vercel, and the database hosted on mongodb atlas.

## Building from source
First set up your development workspace for the environment you would like to test in. 
https://docs.expo.dev/get-started/set-up-your-environment

We recommend using an android emulator as a development build and without EAS
https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local

Clone the repository with git
```
$ git clone https://github.com/dcai22/bananaBus.git
$ cd bananaBus/banana-bus
$ npm i
```

Before we build the application, we should set up our **environment variables**

Edit the template to use your own services
```
MONGODB_URI=""
EMAIL_USER=""
EMAIL_PASS=""
JWT_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_BASE=
```
#### For android
```
npx expo run:android
```
#### For iOS
```
npx expo run:ios
```

To build an .apk you can add the flag `--variant release`
```
npx expo run:android --variant release
```

To run the backend and an instance of the database locally, run:
```
docker-compose up
```

*Note: Due to issues in PC-emulator and PC-phone networking, there is currently no way for the frontend to request properly from a local backend.* 

## Running Tests
To run **frontend tests**
```
npm run app-tests
```

To run **backend tests**
```
npm run api-tests
```
