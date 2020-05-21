import { Injectable } from "@angular/core";


@Injectable()
export class CountryService {
    getCountry() {
        return this.country;
    }

    public country = [
        {
            name: 'Bangladesh', cities: [
                // "Barguna",
                // "Barisal",
                // "Bhola",
                // "Jhalokati",
                // "Patuakhali",
                // "Pirojpur",
                // "Bandarban",
                // "Brahmanbaria",
                // "Chandpur",
                // "Chittagong",
                // "Comilla",
                // "Feni District",
                // "Cox's Bazar",
                // "Khagrachhari",
                // "Lakshmipur",
                // "Noakhali",
                // "Rangamati",
                "Dhaka"
                // "Faridpur",
                // "Gazipur",
                // "Gopalganj",
                // "Kishoreganj",
                // "Madaripur",
                // "Manikganj",
                // "Munshiganj",
                // "Narayanganj",
                // "Narsingdi",
                // "Rajbari",
                // "Shariatpur",
                // "Tangail",
                // "Bagerhat",
                // "Chuadanga",
                // "Jessore",
                // "Jhenaidah",
                // "Khulna",
                // "Kushtia",
                // "Magura",
                // "Meherpur",
                // "Narail",
                // "Satkhira",
                // "Jamalpur",
                // "Mymensingh",
                // "Netrakona",
                // "Sherpur",
                // "Bogra",
                // "Joypurhat",
                // "Naogaon",
                // "Natore",
                // "Chapainawabganj",
                // "Pabna",
                // "Rajshahi",
                // "Sirajgonj",
                // "Dinajpur",
                // "Gaibandha",
                // "Kurigram",
                // "Lalmonirhat",
                // "Nilphamari",
                // "Panchagarh",
                // "Thakurgaon",
                // "Habiganj",
                // "Moulvibazar",
                // "Sunamganj",
                // "Sylhet"
            ]
        },
        // {
        //     name: 'India', cities: [
        //         "Mumbai",
        //         "Delhi",
        //         "Bengaluru",
        //         "Chennai",
        //         "Hyderabad",
        //         "Ahmedabad",
        //         "Kolkata",
        //         "Surat",
        //         "Pune",
        //         "Jaipur",
        //         "Lucknow",
        //         "Kanpur",
        //         "Nagpur",
        //         "Visakhapatnam",
        //         "Indore",
        //         "Thane",
        //         "Bhopal",
        //         "Pimpri-Chinchwad",
        //         "Patna",
        //         "Vadodara",
        //         "Ghaziabad",
        //         "Ludhiana",
        //         "Coimbatore",
        //         "Agra",
        //         "Madurai",

        //     ]
        // },
        // {
        //     name: "Pakistan", cities: [
        //         "Karachi",
        //         "Lahore",
        //         "Faisalabad",
        //         "Rawalpindi",
        //         "Multan",
        //         "Hyderabad",
        //         "Gujranwala",
        //         "Peshawar",
        //         "Quetta",
        //         "Islamabad",
        //         "Sargodha",
        //         "Sialkot",
        //         "Bahawalpur",
        //         "Sukkur",
        //         "Jhang",
        //         "Shekhupura"
        //     ]
        // },
        // {
        //     name: "USA", cities: [
        //         "New York",
        //         "Los Angeles",
        //         "Chicago",
        //         "Houston",
        //         "Philadelphia",
        //         "Phoenix",
        //         "San Antonio",
        //         "San Diego",
        //         "Dallas",
        //         "San Jose",
        //         "Austin",
        //         "Jacksonville",
        //         "San Francisco"
        //     ]
        // }
    ]
}