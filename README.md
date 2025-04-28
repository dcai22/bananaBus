# BANANA BUS 🚌 INSTALLATION MANUAL
## Installing prebuilt APK
The simplest way to run the app for yourself is by installing a prebuilt binary on an android device/emulator. This will use the backend we have hosted on vercel, and the database hosted on mongodb atlas.

## Building from source
First set up your development workspace for the environment you would like to test in. 
https://docs.expo.dev/get-started/set-up-your-environment

We recommend using an android emulator as a development build and without EAS
https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build&buildEnv=local

Either download the zip or
```
$ git clone https://github.com/unsw-cse-comp99-3900/capstone-project-2025-t1-25t1-3900-f15a-banana.git
$ cd banana-bus
$ npm i
```

Before we build the application, we should set up our **environment variables**

There should be one included in the submission in Moodle, or edit the template to use your own services
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
Npm run api-tests
```
