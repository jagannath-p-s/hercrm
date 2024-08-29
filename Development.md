Goal : To Provide an ERP and CRM software for a premium ladies gym , 
& to develop a attedance recording sytem using ESSL magnum and other related hardware

Number of days allocated for the project : 25

Final Demo on 23 september 2023 

number of holidays in between - 5 , 

i,e we have 20 days ( ~3weeks ) to build the entire application 

Selecting the stack : since we only have a limited number of days to build a customized software solution from scratch we will be using a stack we are most familiar with i.e  , we will be using supabase with react , we will be using tailwind css with material ui for a uniform design ( since we do not have a figma design ) , 

lets get started , 

1.creating the react vite app and installing tailwind css

        npm create vite@latest 
            project name : hercrm 
            template : react

        cd hercrm
        npm install 

        npm install -D tailwindcss postcss autoprefixer
        npx tailwindcss init -p

replace contents of tailwind.config.js

with 

            /** @type {import('tailwindcss').Config} */
            export default {
            content: [
                "./index.html",
                "./src/**/*.{js,ts,jsx,tsx}",
            ],
            theme: {
                extend: {},
            },
            plugins: [],
            }

and replace index.css with 

            @tailwind base;
            @tailwind components;
            @tailwind utilities;

replace App.jsx with 

            import { useState } from 'react'
            import reactLogo from './assets/react.svg'
            import viteLogo from '/vite.svg'
            import './App.css'

            export default function App() {
            return (
                <h1 className="text-3xl font-bold underline">
                Hello world!
                </h1>
            )
            }


now we can create our first component 

first create  a 'pages' directory in th src folder of the project , then we have to create few pages PrivateRoute.jsx for preventing unathorized entries LoginPage.jsx for looging in as the user and homepage.jsx where the user will be redirected to after succesfully logging in 

i already have templates available for it so dont have to do everything from scratch 

paste the below codes in the respective files 

add the below code to it , and then we have to , load it first in the App.jsx




which is be a login page we can just use a template , 


i have already build a tailwindcss login page which looks neat , i have also implemented the salting and 
