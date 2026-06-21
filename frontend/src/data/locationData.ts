export type LocationData = {
  [country: string]: {
    [state: string]: {
      [district: string]: string[];
    };
  };
};

export const locationData: LocationData = {
  "India": {
    "Maharashtra": {
      "Ahmednagar": ["Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahata", "Rahuri", "Sangamner", "Shevgaon", "Shrigonda", "Shrirampur"],
      "Akola": ["Akola", "Akot", "Balapur", "Barshitakli", "Murtijapur", "Patur", "Telhara"],
      "Amravati": ["Achalpur", "Amravati", "Anjangaon Surji", "Bhatkuli", "Chandur Bazar", "Chandur Railway", "Chikhaldara", "Daryapur", "Dhamangaon Railway", "Dharni", "Morshi", "Nandgaon-Khandeshwar", "Teosa", "Warud"],
      "Aurangabad": ["Aurangabad", "Chhatrapati Sambhajinagar", "Gangapur", "Kannad", "Khuldabad", "Paithan", "Phulambri", "Sillod", "Soegaon", "Vaijapur"],
      "Beed": ["Ambajogai", "Ashti", "Beed", "Dharur", "Georai", "Kaj", "Majalgaon", "Parli", "Patoda", "Shirur", "Wadwani"],
      "Bhandara": ["Bhandara", "Lakhani", "Mohadi", "Pauni", "Sakoli", "Tumsar"],
      "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Khamgaon", "Lonar", "Malkapur", "Mehkar", "Motala", "Nandura", "Sangrampur", "Shegaon", "Sindkhed Raja"],
      "Chandrapur": ["Ballarpur", "Bhadravati", "Brahmapuri", "Chandrapur", "Chimur", "Gondpipri", "Jivati", "Korpana", "Mul", "Nagbhid", "Pombhurna", "Rajura", "Sawali", "Sindewahi", "Warora"],
      "Dhule": ["Dhule", "Sakri", "Shirpur", "Sindkheda"],
      "Gadchiroli": ["Aheri", "Armori", "Bhamragad", "Chamorshi", "Desaiganj (Vadasa)", "Dhanora", "Etapalli", "Gadchiroli", "Korchi", "Kurkheda", "Mulchera", "Sironcha"],
      "Gondia": ["Amgaon", "Arjuni Morgaon", "Deori", "Gondia", "Goregaon", "Sadak Arjuni", "Salekasa", "Tirora"],
      "Hingoli": ["Aundha (Nagnath)", "Basmath", "Hingoli", "Kalamnuri", "Sengaon"],
      "Jalgaon": ["Amalner", "Bhadgaon", "Bhusawal", "Bodwad", "Chalisgaon", "Chopda", "Dharangaon", "Erandol", "Jalgaon", "Jamner", "Muktainagar", "Pachora", "Parola", "Raver", "Yawal"],
      "Jalna": ["Ambad", "Badnapur", "Bhokardan", "Ghansawangi", "Jafferabad", "Jalna", "Mantha", "Partur"],
      "Kolhapur": ["Ajara", "Bavda", "Bhudargad", "Chandgad", "Gadhinglaj", "Hatkanangle", "Kagal", "Karvir", "Panhala", "Radhanagari", "Shahuwadi", "Shirol"],
      "Latur": ["Ahmadpur", "Ausa", "Chakur", "Deoni", "Jalkot", "Latur", "Nilanga", "Renapur", "Shirur Anantpal", "Udgir"],
      "Mumbai City": ["Mumbai City"],
      "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
      "Nagpur": ["Bhiwapur", "Hingna", "Kalameshwar", "Kamptee", "Katol", "Kuhi", "Mauda", "Nagpur (Rural)", "Nagpur (Urban)", "Narkhed", "Parseoni", "Ramtek", "Savner", "Umred"],
      "Nanded": ["Ardhapur", "Bhokar", "Biloli", "Deglur", "Dharmabad", "Hadgaon", "Himayatnagar", "Kandhar", "Kinwat", "Loha", "Mahur", "Mudkhed", "Mukhed", "Naigaon (Khairgaon)", "Nanded", "Umri"],
      "Nandurbar": ["Akkalkuwa", "Akrani", "Nandurbar", "Navapur", "Shahada", "Talode"],
      "Nashik": ["Baglan", "Chandvad", "Deola", "Dindori", "Igatpuri", "Kalwan", "Malegaon", "Nandgaon", "Nashik", "Niphad", "Peint", "Sinnar", "Surgana", "Trimbakeshwar", "Yevala"],
      "Osmanabad": ["Bhum", "Kalamb", "Lohara", "Omerga", "Osmanabad", "Paranda", "Tuljapur", "Washi"],
      "Palghar": ["Dahanu", "Jawhar", "Mokhada", "Palghar", "Talasari", "Vasai", "Vikramgad", "Wada"],
      "Parbhani": ["Gangakhed", "Jintur", "Manwath", "Palam", "Parbhani", "Pathri", "Purna", "Sailu", "Sonpeth"],
      "Pune": ["Ambegaon", "Baramati", "Bhor", "Daund", "Haveli", "Indapur", "Junnar", "Khed", "Mawal", "Mulshi", "Pune City", "Purandhar", "Shirur", "Velhe"],
      "Raigad": ["Alibag", "Karjat", "Khalapur", "Mahad", "Mangaon", "Mhasla", "Murud", "Panvel", "Pen", "Poladpur", "Roha", "Shrivardhan", "Sudhagad", "Tala", "Uran"],
      "Ratnagiri": ["Chiplun", "Dapoli", "Guhagar", "Khed", "Lanja", "Mandangad", "Rajapur", "Ratnagiri", "Sangameshwar"],
      "Sangli": ["Atpadi", "Jat", "Kadegaon", "Kavathemahankal", "Khanapur", "Miraj", "Palus", "Shirala", "Tasgaon", "Walwa"],
      "Satara": ["Jaoli", "Karad", "Khandala", "Khatav", "Koregaon", "Mahabaleshwar", "Man", "Patan", "Phaltan", "Satara", "Wai"],
      "Sindhudurg": ["Devgad", "Dodamarg", "Kankavli", "Kudal", "Malwan", "Sawantwadi", "Vaibhavvadi", "Vengurla"],
      "Solapur": ["Akkalkot", "Barshi", "Karmala", "Madha", "Malshiras", "Mangalvedhe", "Mohol", "Pandharpur", "Sangole", "Solapur North", "Solapur South"],
      "Thane": ["Ambarnath", "Bhiwandi", "Kalyan", "Murbad", "Shahapur", "Thane", "Ulhasnagar"],
      "Wardha": ["Arvi", "Ashti", "Deoli", "Hinganghat", "Karanja", "Samudrapur", "Seloo", "Wardha"],
      "Washim": ["Karanja", "Malegaon", "Mangrulpir", "Manora", "Risod", "Washim"],
      "Yavatmal": ["Arni", "Babulgaon", "Darwha", "Digras", "Ghatanji", "Kalamb", "Kelapur", "Mahagaon", "Maregaon", "Ner", "Pusad", "Ralegaon", "Umarkhed", "Wani", "Yavatmal", "Zari Jamani"]
    },
    "Madhya Pradesh": {
      "Agar Malwa": ["Agar", "Badod", "Nalkheda", "Susner"],
      "Alirajpur": ["Alirajpur", "Bhavra", "Jobat", "Katthiwada", "Sondwa"],
      "Anuppur": ["Anuppur", "Jaithari", "Kotma", "Pushprajgarh"],
      "Ashoknagar": ["Ashoknagar", "Chanderi", "Isagarh", "Mungaoli", "Shadora"],
      "Balaghat": ["Baihar", "Balaghat", "Birsa", "Katangi", "Khairlanji", "Kirnapur", "Lalburra", "Paraswada", "Tirodi", "Waraseoni"],
      "Barwani": ["Anjad", "Barwani", "Niwali", "Pati", "Rajpur", "Sendhwa", "Thikri"],
      "Betul": ["Amla", "Athner", "Betul", "Bhainsdehi", "Bhimpur", "Chicholi", "Ghodadongari", "Multai", "Prabhat Pattan", "Shahpur"],
      "Bhind": ["Ater", "Bhind", "Gohad", "Lahar", "Mehgaon", "Mihona", "Raun"],
      "Bhopal": ["Berasia", "Huzur", "Kolar"],
      "Burhanpur": ["Burhanpur", "Khaknar", "Nepanagar"],
      "Chhatarpur": ["Bada Malhera", "Bawar", "Bijawar", "Buxwaha", "Chandla", "Chhatarpur", "Gaurihar", "Laundi", "Maharajpur", "Nowgong", "Rajnagar"],
      "Chhindwara": ["Amarwara", "Bichhua", "Chhindwara", "Chourai", "Harrai", "Junnardeo", "Mohkhed", "Pandhurna", "Parasia", "Sausar", "Tamia", "Umreth"],
      "Damoh": ["Batiyagarh", "Damoh", "Hatta", "Jabera", "Patera", "Patharia", "Tendukheda"],
      "Datia": ["Bhander", "Datia", "Indergarh", "Seondha"],
      "Dewas": ["Bagli", "Dewas", "Hatpipliya", "Kannod", "Khategaon", "Satwas", "Sonkatch", "Tonk Khurd"],
      "Dhar": ["Badnawar", "Bagh", "Dahi", "Dhar", "Dharampuri", "Gandhwani", "Kukshi", "Manawar", "Pithampur", "Sardarpur", "Tirla", "Umarban"],
      "Dindori": ["Amarpur", "Bajag", "Dindori", "Karanjiya", "Mehandwani", "Samnapur", "Shahpura"],
      "Guna": ["Aron", "Bamor", "Chachaura", "Guna", "Kumbhraj", "Raghogarh"],
      "Gwalior": ["Bhitarwar", "Chinour", "Dabra", "Ghatigaon", "Gwalior", "Gwalior City"],
      "Harda": ["Harda", "Khirkiya", "Rehatgaon", "Sirali", "Timarni"],
      "Narmadapuram": ["Babai", "Bankhedi", "Dolariya", "Hoshangabad", "Itarsi", "Makkhan Nagar", "Pipariya", "Seoni Malwa", "Sohagpur"],
      "Indore": ["Depalpur", "Hatod", "Indore", "Mhow", "Sanwer"],
      "Jabalpur": ["Jabalpur", "Kundam", "Majholi", "Panagar", "Patan", "Shahpura", "Sihora"],
      "Jhabua": ["Jhabua", "Kalyanpura", "Meghnagar", "Petiya", "Rama", "Ranapur", "Thandla"],
      "Katni": ["Bahoriband", "Barhi", "Dhimerkheda", "Katni", "Murwara", "Rithi", "Vijayraghavgarh"],
      "Khandwa": ["Harsud", "Khalwa", "Khandwa", "Pandhana", "Punay"],
      "Khargone": ["Barwaha", "Bhagwanpura", "Bhikangaon", "Gogawan", "Jhiranya", "Kasrawad", "Khargone", "Maheshwar", "Segaon"],
      "Mandla": ["Bichhiya", "Bijadandi", "Ghughri", "Mandla", "Mawai", "Nainpur", "Narayanganj", "Niwas"],
      "Mandsaur": ["Bhanpura", "Dalouda", "Garoth", "Malhargarh", "Mandsaur", "Shamgarh", "Sitamanu", "Suwasra"],
      "Morena": ["Ambah", "Bamor", "Joura", "Kailaras", "Morena", "Porsa", "Sabalgarh"],
      "Narsinghpur": ["Careli", "Gadarwara", "Gotegaon", "Narsinghpur", "Tendukheda"],
      "Neemuch": ["Javad", "Jeeran", "Manasa", "Neemuch"],
      "Panna": ["Ajaigarh", "Amanganj", "Devendranagar", "Gunnour", "Panna", "Pawai", "Raipura", "Shahnagar"],
      "Raisen": ["Badi", "Bareli", "Begamganj", "Gairatganj", "Goharganj", "Obaidullaganj", "Raisen", "Silwani", "Udaipura"],
      "Rajgarh": ["Biaora", "Jirapur", "Khilchipur", "Narsinghgarh", "Pachore", "Rajgarh", "Sarangpur", "Zirapur"],
      "Ratlam": ["Alot", "Bajna", "Jaora", "Piploda", "Ratlam", "Rawti", "Sailana", "Tal"],
      "Rewa": ["Gangeo", "Hanumana", "Huzur", "Jawa", "Mangawan", "Mauganj", "Nai Garhi", "Raipur Karchuliyan", "Rewa", "Semaria", "Sirmaur", "Teonthar"],
      "Sagar": ["Banda", "Bina", "Deori", "Garhakota", "Khurai", "Malthone", "Rahatgarh", "Rehli", "Sagar", "Shahgarh"],
      "Satna": ["Amarpatan", "Kothi", "Maihar", "Majhgawan", "Nagod", "Ramnagar", "Rampur Baghelan", "Satna", "Unchehara"],
      "Sehore": ["Ashta", "Budni", "Ichhawar", "Jawar", "Nasrullaganj", "Rehti", "Sehore", "Shyampur"],
      "Seoni": ["Barghat", "Chhapara", "Dhanora", "Ghansaur", "Keolari", "Kurai", "Lakhnadon", "Seoni"],
      "Shahdol": ["Beohari", "Burhar", "Gohparu", "Jaisinghnagar", "Sohagpur"],
      "Shajapur": ["Avantipur Badodia", "Gulman", "Kalapipal", "Mohan Badodia", "Polay Kalan", "Shajapur", "Shujalpur"],
      "Sheopur": ["Baroda", "Karahal", "Sheopur", "Vijaypur"],
      "Shivpuri": ["Badarwas", "Bairad", "Karera", "Khaniadhana", "Kolaras", "Narwar", "Pichhore", "Pohari", "Shivpuri"],
      "Sidhi": ["Churhat", "Gopadbanas", "Kusmi", "Majhauli", "Rampur Naikin", "Sihawal"],
      "Singrauli": ["Chitrangi", "Deosar", "Mada", "Singrauli", "Waidhan"],
      "Tikamgarh": ["Baldeogarh", "Jatara", "Khargapur", "Mohangarh", "Niwari", "Palera", "Prithvipur", "Tikamgarh"],
      "Ujjain": ["Badnagar", "Ghatiya", "Khachrod", "Mahidpur", "Nagda", "Tarana", "Ujjain"],
      "Umaria": ["Bandhavgarh", "Birsinghpur Pali", "Chandia", "Manpur", "Nowrozabad"],
      "Vidisha": ["Basoda", "Gyaraspur", "Kurwai", "Lateri", "Nateran", "Shamshabad", "Sironj", "Vidisha"]
    },
    "Gujarat": {
      "Ahmedabad": ["Ahmedabad City", "Bavla", "Daskroi", "Detroj-Rampura", "Dhandhuka", "Dholera", "Dholka", "Mandal", "Sanand", "Viramgam"],
      "Surat": ["Bardoli", "Choryasi", "Kamrej", "Mahuva", "Mandvi", "Mangrol", "Olpad", "Palsana", "Surat City", "Umarpada"],
      "Vadodara": ["Dabhoi", "Desar", "Karjan", "Padra", "Savli", "Sinor", "Vadodara", "Vaghodia"]
      // You can add more districts and talukas for Gujarat here
    },
    "Karnataka": {
      "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Yelahanka", "Anekal"],
      "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara", "Nanjangud", "Piriyapatna", "T. Narasipura", "H.D. Kote"],
      "Dakshina Kannada": ["Mangaluru", "Bantwal", "Puttur", "Sullia", "Belthangady"]
      // You can add more districts and talukas for Karnataka here
    }
  },
  "United States": {
    "California": {
      "Los Angeles": ["Los Angeles City", "Long Beach", "Santa Monica"],
      "San Francisco": ["San Francisco City"]
    },
    "New York": {
      "New York County": ["Manhattan", "Brooklyn", "Queens"]
    }
  }
};
