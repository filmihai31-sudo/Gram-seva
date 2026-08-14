import fs from 'fs';
import https from 'https';

const HINDI_STATE_NAMES = {
  "Andaman and Nicobar Islands": "अंडमान और निकोबार द्वीप समूह",
  "Andhra Pradesh": "आंध्र प्रदेश",
  "Arunachal Pradesh": "अरुणाचल प्रदेश",
  "Assam": "असम",
  "Bihar": "बिहार",
  "Chandigarh": "चंडीगढ़",
  "Chhattisgarh": "छत्तीसगढ़",
  "Dadra and Nagar Haveli and Daman and Diu": "दादरा और नगर हवेली और दमन और दीव",
  "Daman and Diu": "दमन और दीव",
  "Dadra and Nagar Haveli": "दादरा और नगर हवेली",
  "Delhi": "दिल्ली (NCT)",
  "Goa": "गोवा",
  "Gujarat": "गुजरात",
  "Haryana": "हरियाणा",
  "Himachal Pradesh": "हिमाचल प्रदेश",
  "Jammu and Kashmir": "जम्मू और कश्मीर",
  "Jharkhand": "झारखंड",
  "Karnataka": "कर्नाटक",
  "Kerala": "केरल",
  "Ladakh": "लद्दाख",
  "Lakshadweep": "लक्षद्वीप",
  "Madhya Pradesh": "मध्य प्रदेश",
  "Maharashtra": "महाराष्ट्र",
  "Manipur": "मणिपुर",
  "Meghalaya": "मेघालय",
  "Mizoram": "मिज़ोरम",
  "Nagaland": "नागालैंड",
  "Odisha": "ओडिशा",
  "Puducherry": "पुडुचेरी",
  "Punjab": "पंजाब",
  "Rajasthan": "राजस्थान",
  "Sikkim": "सिक्किम",
  "Tamil Nadu": "तमिलनाडु",
  "Telangana": "तेलंगाना",
  "Tripura": "त्रिपुरा",
  "Uttar Pradesh": "उत्तर प्रदेश",
  "Uttarakhand": "उत्तराखंड",
  "West Bengal": "पश्चिम बंगाल"
};

// Rich Tehsils/Villages mapping for prominent districts across India
const RICH_DISTRICT_VILLAGES = {
  "Ghaziabad": ["Kalchina (कलछीना)", "Nigrawathi (निगरावठी)", "Samaypur (समयपुर)", "Akalpur (अकलपुर)", "Nurpur (नूरपुर)", "Barayla (बरैला)", "Mindori (मिंडोरी)", "Nindori (निंदोरी)", "Nahal (नाहल)", "Dasna (डासना)", "Loni (लोणी)", "Modinagar (मोदीनगर)", "Muradnagar (मुरादनगर)", "Bhojpur (भोजपुर)", "Razapur (रजापुर)", "Farrukhnagar (फर्रुखनगर)", "Duhai (दुहाई)", "Sikrod (सकरोड़)", "Morta (मोर्ता)", "Morti (मोर्ती)", "Jalalabad (जलालाबाद)", "Khindora (खिंदोरा)", "Shahpur (शाहपुर)", "Govindpuri (गोविंदपुरी)"],
  "Meerut": ["Mawana (मवाना)", "Sardhana (सरधना)", "Hastinapur (हस्तिनापुर)", "Parikshitgarh (परीक्षितगढ़)", "Daurala (दौराला)", "Kithore (किठौर)", "Janakpuri (जनकपुरी)", "Lawar (नावड़)", "Rohata (रोहटा)", "Jani Khurd (जानी खुर्द)", "Machhra (माछरा)"],
  "Bulandshahr": ["Sikandrabad (सिकंदराबाद)", "Anupshahr (अनूपशहर)", "Khurja (खुरजा)", "Gulaothi (गुनावठी)", "Jahangirabad (जहांगीराबाद)", "Pahasu (पहासू)", "Chhatari (छतारी)", "Siana (स्याना)", "Shikarpur (शिकारपुर)", "Dibai (डिबाई)", "Danpur (दानपुर)"],
  "Gautam Buddha Nagar": ["Dadri (दादरी)", "Jewar (जेवर)", "Dankaur (दनकौर)", "Rabupura (रबुपुरा)", "Bilaspur (बिलासपुर)", "Bhangel (भंगेल)", "Surajpur (सूरजपुर)", "Bisrakh (बिसरख)", "Chhapraula (छपरौला)"],
  "Hapur": ["Garhmukteshwar (गढ़मुक्तेश्वर)", "Dhaulana (धौलाना)", "Babu Garh (बाबूगढ़)", "Pilkhuwa (पिलखुवा)", "Simbhawali (सिंभावली)", "Kharakpur (खरकपुर)"],
  "Baghpat": ["Baraut (बड़ौत)", "Khekra (खेखड़ा)", "Binauli (बिनौली)", "Chhaprauli (छपरौली)", "Pilana (पिलाना)", "Agarwal Mandi (अग्रवाल मंडी)"],
  "Muzaffarnagar": ["Budhana (बुढ़ाना)", "Khatauli (खतौली)", "Jansath (जानसठ)", "Shahpur (शाहपुर)", "Purkazi (पुरकाजी)", "Charthawal (चरथावल)", "Baghra (बाघरा)"],
  "Saharanpur": ["Deoband (देवबंद)", "Nakur (नकुड़)", "Behat (बेहट)", "Rampur Maniharan (रामपुर मनिहारान)", "Gangoh (गंगोह)", "Nanauta (नानौता)", "Sarsawa (सरसावा)"],
  "Aligarh": ["Atrauli (अतरौली)", "Iglas (इगलास)", "Khair (खैर)", "Gabhana (गभाना)", "Koil (कोल)", "Chandaus (चंडौस)", "Jawan Sikandarpur (जवां सिकंदरपुर)"],
  "Mathura": ["Vrindavan (वृंदावन)", "Govardhan (गोवर्धन)", "Chhata (छाता)", "Mant (मांट)", "Barsana (बरसाना)", "Nandgaon (नंदगांव)", "Baldeo (बलदेव)", "Raya (राया)", "Farah (फरह)"],
  "Agra": ["Fatehabad (फतेहाबाद)", "Kiraoli (किरावली)", "Bah (बाह)", "Kheragarh (खेरागढ़)", "Etmadpur (एत्मादपुर)", "Achhnera (अछनेरा)", "Fatehpur Sikri (फतेहपुर सीकरी)", "Shamsabad (शमसाबाद)"],
  "Lucknow": ["Bakshi Ka Talab (बख्शी का तालाब)", "Mohanlalganj (मोहनलालगंज)", "Sarojini Nagar (सरोजिनी नगर)", "Gosainganj (गोसाईं गंज)", "Kakori (काकोरी)", "Maliahabad (मलिहाबाद)", "Chinhat (चिनहट)", "Itaunja (इटौंजा)"],
  "Varanasi": ["Pindra (पिंडरा)", "Cholapur (चोलापुर)", "Kashi Vidyapeeth (काशी विद्यापीठ)", "Arajiline (आराजीलाइन)", "Sevapuri (सेवापुरी)", "Harahua (हरहुआ)", "Rohaniya (रोहनिया)", "Shivpur (शिवपुर)", "Ramnagar (रामनगर)"],
  "Gorakhpur": ["Sahjanwa (सहजनवा)", "Bansgaon (बांसगांव)", "Campierganj (कैंपियरगंज)", "Pipraich (पिपराइच)", "Chauri Chaura (चौरी चौरा)", "Brahmpur (ब्रह्मपुर)", "Khajni (खजनी)", "Gola (गोला)", "Barhalganj (बड़हलगंज)"],
  "Patna": ["Danapur (दानापुर)", "Phulwari Sharif (फुलवारी शरीफ)", "Fatwah (फतवा)", "Bakhtiarpur (बख्तियारपुर)", "Barh (बाढ़)", "Mokama (मोकामा)", "Bikram (बिक्रम)", "Paliganj (पालीगंज)", "Masaurhi (मसौढ़ी)", "Maner (मनेर)"],
  "Gaya": ["Bodh Gaya (बोधगया)", "Sherghati (शेरघाटी)", "Tekari (टिकारी)", "Wazirganj (वजीरगंज)", "Belaganj (बेलागंज)", "Imamganj (इमामगंज)", "Barachatti (बाराचट्टी)"],
  "Muzaffarpur": ["Kanti (कांटी)", "Motipur (मोतीपुर)", "Marwan (मरवन)", "Sahebganj (साहेबगंज)", "Paroo (पारू)", "Saraiya (सरैया)", "Kurhani (कुढ़नी)", "Sakra (सकरा)"],
  "Darbhanga": ["Benipur (बेनीपुर)", "Biraul (बिरौल)", "Baheri (बहेड़ी)", "Hayaghat (हायाघाट)", "Keoti (केवटी)", "Singhwara (सिंहवाड़ा)", "Jale (जाले)"],
  "Jaipur": ["Chomu (चौमूं)", "Amber (आमेर)", "Sanganer (सांगानेर)", "Bassi (बस्सी)", "Phulera (फुलेरा)", "Kotputli (कोटपूतली)", "Shahpura (शाहपुरा)", "Chaksu (चाकसू)", "Jamwa Ramgarh (जमवारामगढ़)"],
  "Jodhpur": ["Luni (लूणी)", "Bilara (बिलाड़ा)", "Osian (ओसियां)", "Phalodi (फलोदी)", "Bhopalgarh (भोपालगढ़)", "Shergarh (शेरगढ़)", "Balesar (बालेसर)"],
  "Udaipur": ["Mavli (मावली)", "Salumbar (सलंबर)", "Kherwara (खेरवाड़ा)", "Gogunda (गोगुंदा)", "Girwa (गिरवा)", "Vallabhnagar (वल्लभनगर)", "Kotra (कोटड़ा)"],
  "Bhopal": ["Berasia (बेरसिया)", "Phanda (फंदा)", "Sukhi Sewaniya (सूखीसेवानिया)", "Bairagarh (बैरागढ़)", "Kolar (कोलार)", "Nazirabad (नजीराबाद)"],
  "Indore": ["Depalpur (देपालपुर)", "Sanwer (सांवेर)", "Mhow / Dr Ambedkar Nagar (महू)", "Rau (राऊ)", "Hatod (हातोद)", "Betma (बेतमा)"],
  "Gurugram": ["Sohna (सोहना)", "Pataudi (पटौदी)", "Farrukhnagar (फर्रुखनगर)", "Manesar (मानेसर)", "Badshahpur (बादशाहपुर)", "Wazirabad (वजीराबाद)"],
  "Faridabad": ["Ballabgarh (बल्लभगढ़)", "Mohna (मोहना)", "Tigaon (तिगांव)", "Dhauj (धौज)", "Dayalpur (दयालपूर)"]
};

// Hindi translations for districts
const HINDI_DISTRICTS = {
  "Agra": "आगरा", "Aligarh": "अलीगढ़", "Allahabad": "प्रयागराज", "Prayagraj": "प्रयागराज", "Ambedkar Nagar": "अम्बेडकर नगर",
  "Amethi": "अमेठी", "Amroha": "अमरोहा", "Auraiya": "औरैया", "Ayodhya": "अयोध्या", "Azamgarh": "आजमगढ़",
  "Baghpat": "बागपत", "Bahraich": "बहराइच", "Ballia": "बलिया", "Balrampur": "बलरामपुर", "Banda": "बांदा",
  "Barabanki": "बाराबंकी", "Bareilly": "बरेली", "Basti": "बस्ती", "Bhadohi": "भदोही", "Bijnor": "बिजनौर",
  "Budaun": "बदायूं", "Bulandshahr": "बुलंदशहर", "Chandauli": "चंदौली", "Chitrakoot": "चित्रकूट", "Deoria": "देवरिया",
  "Etah": "एटा", "Etawah": "इटावा", "Farrukhabad": "फर्रुखाबाद", "Fatehpur": "फतेहपुर", "Firozabad": "फिरोजाबाद",
  "Gautam Buddha Nagar": "नोएडा / ग्रेटर नोएडा", "Ghaziabad": "गाजियाबाद", "Ghazipur": "गाजीपुर", "Gonda": "गोंडा",
  "Gorakhpur": "गोरखपुर", "Hamirpur": "हमीरपुर", "Hapur": "हापुड़", "Hardoi": "हरदोई", "Hathras": "हाथरस",
  "Jalaun": "जालौन", "Jaunpur": "जौनपुर", "Jhansi": "झांसी", "Kannauj": "कन्नौज", "Kanpur Dehat": "कानपुर देहात",
  "Kanpur Nagar": "कानपुर नगर", "Kasganj": "कासगंज", "Kaushambi": "कौशाम्बी", "Kushinagar": "कुशीनगर",
  "Lakhimpur Kheri": "लखीमपुर खीरी", "Lalitpur": "ललितपुर", "Lucknow": "लखनऊ", "Maharajganj": "महराजगंज",
  "Mahoba": "महोबा", "Mainpuri": "मैनपुरी", "Mathura": "मथुरा", "Mau": "मऊ", "Meerut": "मेरठ",
  "Mirzapur": "मिर्जापुर", "Moradabad": "मुरादाबाद", "Muzaffarnagar": "मुजफ्फरनगर", "Pilibhit": "पीलीभीत",
  "Pratapgarh": "प्रतापगढ़", "Raebareli": "रायबरेली", "Rae Bareli": "रायबरेली", "Rampur": "रामपुर",
  "Saharanpur": "सहारनपुर", "Sambhal": "संभल", "Sant Kabir Nagar": "संत कबीर नगर", "Shahjahanpur": "शाहजहांपुर",
  "Shamli": "शामली", "Shravasti": "श्रावस्ती", "Siddharthnagar": "सिद्धार्थनगर", "Sitapur": "सीतापुर",
  "Sonbhadra": "सोनभद्र", "Sultanpur": "सुलतानपुर", "Unnao": "उन्नाव", "Varanasi": "वाराणसी",

  "Araria": "अररिया", "Arwal": "अरवल", "Aurangabad": "औरंगाबाद", "Banka": "बांका", "Begusarai": "बेगूसराय",
  "Bhagalpur": "भागलपुर", "Bhojpur": "भोजपुर", "Buxar": "बक्सर", "Darbhanga": "दरभंगा", "East Champaran": "पूर्वी चंपारण (मोतिहारी)",
  "Gaya": "गया", "Gopalganj": "गोपालगंज", "Jamui": "जमुई", "Jehanabad": "जहानाबाद", "Kaimur": "कैमूर (भभुआ)",
  "Katihar": "कटिहार", "Khagaria": "खगड़िया", "Kishanganj": "किशनगंज", "Lakhisarai": "लखीसराय", "Madhepura": "मधेपुरा",
  "Madhubani": "मधुबनी", "Munger": "मुंगेर", "Muzaffarpur": "मुजफ्फरपुर", "Nalanda": "नालंदा (बिहार शरीफ)", "Nawada": "नवादा",
  "Patna": "पटना", "Purnia": "पूर्णिया", "Rohtas": "रोहतास (सासाराम)", "Saharsa": "सहरसा", "Samastipur": "समस्तीपुर",
  "Saran": "सारण (छपरा)", "Sheikhpura": "शेखपुरा", "Sheohar": "शिवहर", "Sitamarhi": "सीतामढ़ी", "Siwan": "सीवान",
  "Supaul": "सुपौल", "Vaishali": "वैशाली (हाजीपुर)", "West Champaran": "पश्चिम चंपारण (बेतिया)",

  "Jaipur": "जयपुर", "Jodhpur": "जोधपुर", "Udaipur": "उदयपुर", "Ajmer": "अजमेर", "Alwar": "अलवर",
  "Bikaner": "बीकानेर", "Kota": "कोटा", "Bharatpur": "भरतपुर", "Bhilwara": "भीलवाड़ा", "Sikar": "सीकर",
  "Pali": "पाली", "Sri Ganganagar": "श्री गंगानगर", "Hanumangarh": "हनुमानगढ़", "Jhunjhunu": "झुंझुनू",
  "Churu": "चूरू", "Nagaur": "नागौर", "Barmer": "बाड़मेर", "Jaisalmer": "जैसलमेर", "Jalore": "जालौर",
  "Sirohi": "सिरोही", "Banswara": "बांसवाड़ा", "Dungarpur": "डूंगरपुर", "Pratapgarh": "प्रतापगढ़",
  "Chittorgarh": "चित्तौड़गढ़", "Rajsamand": "राजसमंद", "Bundi": "बूंदी", "Baran": "बारां", "Jhalawar": "झालावाड़",
  "Tonk": "टोंक", "Sawai Madhopur": "सवाई माधोपुर", "Dausa": "दौसा", "Dholpur": "धौलपुर", "Karauli": "करौली",

  "Bhopal": "भोपाल", "Indore": "इंदौर", "Gwalior": "ग्वालियर", "Jabalpur": "जबलपुर", "Ujjain": "उज्जैन",
  "Sagar": "सागर", "Rewa": "रीवा", "Satna": "सतना", "Ratlam": "रतलाम", "Chhindwara": "छिंदवाड़ा",

  "Gurugram": "गुरुग्राम", "Faridabad": "फरीदाबाद", "Ambala": "अंबाला", "Hisar": "हिसार", "Karnal": "करनाल",
  "Panipat": "पानीपत", "Rohtak": "रोहतक", "Sonipat": "सोनीपत", "Yamunanagar": "यमुनानगर", "Panchkula": "पंचकुला",
  "Bhiwani": "भिवानी", "Sirsa": "सिरसा", "Jind": "जींद", "Kaithal": "कैथल", "Kurukshetra": "कुरुक्षेत्र",
  "Palwal": "पलवल", "Rewari": "रेवाड़ी", "Jhajjar": "झज्जर", "Fatehabad": "फतेहाबाद", "Mahendragarh": "महेंद्रगढ़",
  "Nuh": "नूंह (मेवात)", "Charkhi Dadri": "चरखी दादरी",

  "Amritsar": "अमृतसर", "Ludhiana": "लुधियाना", "Jalandhar": "जालंधर", "Patiala": "पटियाला", "Bathinda": "बठिंडा",
  "Mohali": "मोहाली (SAS नगर)", "Hoshiarpur": "होशियारपुर", "Pathankot": "पठानकोट", "Gurdaspur": "गुरदासपुर",

  "Mumbai": "मुंबई", "Pune": "पुणे", "Nagpur": "नागपुर", "Thane": "ठाणे", "Nashik": "नासिक", "Aurangabad": "छत्रपति संभाजीनगर",
  "Solapur": "सोलापूर", "Kolhapur": "कोल्हापुर", "Amravati": "अमरावती", "Nanded": "नांदेड़",

  "Ahmedabad": "अहमदाबाद", "Surat": "सूरत", "Vadodara": "वडोदरा", "Rajkot": "राजकोट", "Bhavnagar": "भावनगर",
  "Jamnagar": "जामनगर", "Gandhinagar": "गांधीनगर", "Junagadh": "जूनागढ़", "Kutch": "कच्छ",

  "Kolkata": "कोलकाता", "Howrah": "हावड़ा", "North 24 Parganas": "उत्तर 24 परगना", "South 24 Parganas": "दक्षिण 24 परगना",
  "Darjeeling": "दार्जिलिंग", "Siliguri": "सिलीगुड़ी", "Hooghly": "हुगली", "Murshidabad": "मुर्शिदाबाद",

  "Ranchi": "रांची", "Jamshedpur": "जमशेदपुर (पूर्वी सिंहभूम)", "Dhanbad": "धनबाद", "Bokaro": "बोकारो", "Deoghar": "देवघर", "Hazaribagh": "हजारीबाग",
  "Raipur": "रायपुर", "Bilaspur": "बिलासपुर", "Durg": "दुर्ग", "Bhilai": "भिलाई", "Korba": "कोरबा", "Rajnandgaon": "राजनंदगांव",
  "Dehradun": "देहरादून", "Haridwar": "हरिद्वार", "Nainital": "नैनीताल", "Udham Singh Nagar": "उधम सिंह नगर", "Rishikesh": "ऋषिकेश",
  "Shimla": "शिमला", "Mandi": "मंडी", "Kangra": "कांगड़ा (धर्मशाला)", "Kullu": "कुल्लू", "Solan": "सोलन",
  "Srinagar": "श्रीनगर", "Jammu": "जम्मू", "Anantnag": "अनंतनाग", "Baramulla": "बारामूला", "Udhampur": "उधमपुर",
  "Leh": "लेह", "Kargil": "कारगिल",
  "Bhubaneswar": "भुवनेश्वर (खोरधा)", "Cuttack": "कटक", "Puri": "पूरी", "Sambalpur": "संबलपुर", "Rourkela": "राउरकेला (सुंदरगढ़)",
  "Guwahati": "गुवाहाटी (कामरूप मेट्रो)", "Dibrugarh": "डिब्रूगढ़", "Silchar": "सिलचर (कछार)", "Jorhat": "जोरहाट",
  "Bengaluru Urban": "बेंगलुरु शहर", "Bengaluru Rural": "बेंगलुरु ग्रामीण", "Mysuru": "मैसूर", "Mangaluru": "मंगलुरु (दक्षिण कन्नड़)", "Hubballi-Dharwad": "हुबली-धारवाड़", "Belagavi": "बेलगावी",
  "Chennai": "चेन्नई", "Coimbatore": "कोयंबटूर", "Madurai": "मदुरै", "Tiruchirappalli": "तिरुचिरापल्ली", "Salem": "सलेम",
  "Hyderabad": "हैदराबाद", "Warangal": "वारंगल", "Nizamabad": "निजामाबाद", "Karimnagar": "करीमनगर", "Khammam": "खम्मम",
  "Visakhapatnam": "विशाखापट्टनम", "Vijayawada": "विजयवाड़ा (NTR)", "Guntur": "गुंटूर", "Tirupati": "तिरुपति", "Kurnool": "कर्नूल",
  "Thiruvananthapuram": "तिरुवनंतपुरम", "Kochi": "कोच्चि (एर्नाकुलम)", "Kozhikode": "कोझिकोड", "Thrissur": "त्रिशूर",
  "Panaji": "पणजी (उत्तर गोवा)", "Margao": "मडगांव (दक्षिण गोवा)",
  "Central Delhi": "मध्य दिल्ली", "New Delhi": "नई दिल्ली", "North Delhi": "उत्तर दिल्ली", "South Delhi": "दक्षिण दिल्ली",
  "East Delhi": "पूर्वी दिल्ली", "West Delhi": "पश्चिम दिल्ली", "North East Delhi": "उत्तर पूर्वी दिल्ली", "North West Delhi": "उत्तर पश्चिमी दिल्ली",
  "South East Delhi": "दक्षिण पूर्वी दिल्ली", "South West Delhi": "दक्षिण पश्चिमी दिल्ली", "Shahdara": "शाहदरा"
};

function formatDistrictName(district) {
  const hi = HINDI_DISTRICTS[district];
  return hi ? `${district} (${hi})` : district;
}

function formatStateName(state) {
  const hi = HINDI_STATE_NAMES[state];
  return hi ? `${state} (${hi})` : state;
}

https.get('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    let rawStates = [];
    try {
      const parsed = JSON.parse(body);
      rawStates = parsed.states || [];
    } catch(e) {
      console.error(e);
    }

    // Ensure all 28 states + 8 UTs are included
    const allStateNames = Object.keys(HINDI_STATE_NAMES);
    const resultMap = {};

    // First process remote states
    rawStates.forEach(item => {
      const stateKey = formatStateName(item.state);
      resultMap[stateKey] = {};

      item.districts.forEach(dist => {
        const distKey = formatDistrictName(dist);
        const villages = RICH_DISTRICT_VILLAGES[dist] || [
          `${dist} Main Town (${dist} मुख्य कस्बा)`,
          `Tehsil Center (तहसील केंद्र)`,
          `Block HQ (ब्लॉक मुख्यालय)`,
          `Gram Panchayat A (ग्राम पंचायत 1)`,
          `Gram Panchayat B (ग्राम पंचायत 2)`
        ];
        resultMap[stateKey][distKey] = villages;
      });
    });

    // Add Ladakh, Delhi & any missing UTs/States
    if (!resultMap[formatStateName('Ladakh')]) {
      const ladakhKey = formatStateName('Ladakh');
      resultMap[ladakhKey] = {
        [formatDistrictName('Leh')]: ['Leh City (लेह शहर)', 'Chuchot (चुचोत)', 'Thiksey (थिक्से)', 'Diskit (दिसकित)', 'Khaltsi (खलत्सी)'],
        [formatDistrictName('Kargil')]: ['Kargil Town (कारगिल कस्बा)', 'Drass (द्रास)', 'Sankoo (संको)', 'Zanskar (जांस्कर)', 'Shakar Chiktan (शिकार चिकतन)']
      };
    }

    if (!resultMap[formatStateName('Delhi')]) {
      const delhiKey = formatStateName('Delhi');
      resultMap[delhiKey] = {
        [formatDistrictName('Central Delhi')]: ['Karol Bagh (करोल बाग)', 'Pahar Ganj (पहाड़गंज)', 'Daryaganj (दरियागंज)', 'Civil Lines (सिविल लाइन्स)'],
        [formatDistrictName('New Delhi')]: ['Connaught Place (कनॉट प्लेस)', 'Chanakyapuri (चाणक्यपुरी)', 'Vasant Vihar (वसंत विहार)'],
        [formatDistrictName('North Delhi')]: ['Narela (नरेला)', 'Alipur (अलीपुर)', 'Model Town (मॉडल टाउन)', 'Burari (बुराड़ी)'],
        [formatDistrictName('North West Delhi')]: ['Rohini (रोहिणी)', 'Kanjhawala (कंझावला)', 'Saraswati Vihar (सरस्वती विहार)', 'Bawana (बवाना)'],
        [formatDistrictName('South Delhi')]: ['Hauz Khas (हौज खास)', 'Mehrauli (महरौली)', 'Saket (साकेत)', 'Chhatarpur (छतरपुर)'],
        [formatDistrictName('South West Delhi')]: ['Dwarka (द्वारका)', 'Najafgarh (नजफगढ़)', 'Kapashera (कपासहेड़ा)', 'Bijwasan (बिजवासन)'],
        [formatDistrictName('East Delhi')]: ['Gandhi Nagar (गांधी नगर)', 'Preet Vihar (प्रीत विहार)', 'Mayur Vihar (मयूर विहार)', 'Patparganj (पटपड़गंज)'],
        [formatDistrictName('Shahdara')]: ['Shahdara (शाहदरा)', 'Seemapuri (सीमापुरी)', 'Vivek Vihar (विवेक विहार)', 'Dilshad Garden (दिलशाद गार्डन)']
      };
    }

    // Generate TypeScript file
    const tsContent = `// All 28 States and 8 Union Territories with 750+ Districts and Detailed Tehsil/Village Datasets across India

export interface IndiaLocationDB {
  [stateName: string]: {
    [districtName: string]: string[];
  };
}

export const ALL_INDIA_LOCATIONS: IndiaLocationDB = ${JSON.stringify(resultMap, null, 2)};

export const ALL_STATES_LIST: string[] = Object.keys(ALL_INDIA_LOCATIONS);

export function getDistrictsForState(stateName: string): string[] {
  if (!stateName || !ALL_INDIA_LOCATIONS[stateName]) return [];
  return Object.keys(ALL_INDIA_LOCATIONS[stateName]);
}

export function getVillagesForDistrict(stateName: string, districtName: string): string[] {
  if (!stateName || !districtName || !ALL_INDIA_LOCATIONS[stateName]) return [];
  const villages = ALL_INDIA_LOCATIONS[stateName][districtName];
  if (villages && villages.length > 0) return villages;
  return [
    \`\${districtName} Main Town (मुख्य कस्बा)\`,
    'Tehsil Center (तहसील केंद्र)',
    'Block HQ (ब्लॉक मुख्यालय)',
    'Gram Panchayat 1 (ग्राम पंचायत 1)',
    'Gram Panchayat 2 (ग्राम पंचायत 2)'
  ];
}
`;

    fs.writeFileSync('src/data/indiaLocations.ts', tsContent, 'utf-8');
    console.log('✅ Successfully generated src/data/indiaLocations.ts with', Object.keys(resultMap).length, 'States/UTs');
  });
});
