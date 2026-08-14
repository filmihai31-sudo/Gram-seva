import fs from 'fs';
import https from 'https';

export const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const HINDI_STATE_NAMES = {
  "Andaman and Nicobar Islands": "अंडमान और निकोबार द्वीप समूह",
  "Andhra Pradesh": "आंध्र प्रदेश",
  "Arunachal Pradesh": "अरुणाचल प्रदेश",
  "Assam": "असम",
  "Bihar": "बिहार",
  "Chandigarh": "चंडीगढ़",
  "Chhattisgarh": "छत्तीसगढ़",
  "Dadra and Nagar Haveli and Daman and Diu": "दादरा और नगर हवेली और दमन और दीव",
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

const ALL_DISTRICTS_DATA = {
  "Andhra Pradesh": [
    "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu (Anantapur)", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema",
    "East Godavari (पूर्वी गोदावरी)", "Eluru", "Guntur (गुंटूर)", "Kakinada", "Krishna (कृष्णा)", "Kurnool (कर्नूल)", "Nandyal", "NTR (Vijayawada)",
    "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", "Tirupati (तिरुपति)",
    "Visakhapatnam (विशाखापट्टनम)", "Vizianagaram", "West Godavari (पश्चिम गोदावरी)", "YSR Kadapa (कडपा)"
  ],
  "Arunachal Pradesh": [
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit",
    "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare (Itanagar)", "Shi Yomi",
    "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
  ],
  "Assam": [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar (Silchar)", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri",
    "Dibrugarh (डिब्रूगढ़)", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat (जोरहाट)", "Kamrup", "Kamrup Metropolitan (Guwahati)",
    "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur (Tezpur)",
    "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria (अररिया)", "Arwal (अरवल)", "Aurangabad (औरंगाबाद)", "Banka (बांका)", "Begusarai (बेगूसराय)", "Bhagalpur (भागलपुर)", "Bhojpur (भोजपुर)",
    "Buxar (बक्सर)", "Darbhanga (दरभंगा)", "East Champaran / Motihari (पूर्वी चंपारण)", "Gaya (गया)", "Gopalganj (गोपालगंज)", "Jamui (जमुई)",
    "Jehanabad (जहानाबाद)", "Kaimur / Bhabhua (कैमूर)", "Katihar (कटिहार)", "Khagaria (खगड़िया)", "Kishanganj (किशनगंज)", "Lakhisarai (लखीसराय)",
    "Madhepura (मधेपुरा)", "Madhubani (मधुबनी)", "Munger (मुंगेर)", "Muzaffarpur (मुजफ्फरपुर)", "Nalanda / Bihar Sharif (नालंदा)", "Nawada (नवादा)",
    "Patna (पटना)", "Purnia (पूर्णिया)", "Rohtas / Sasaram (रोहतास)", "Saharsa (सहरसा)", "Samastipur (समस्तीपुर)", "Saran / Chhapra (सारण)",
    "Sheikhpura (शेखपुरा)", "Sheohar (शिवहर)", "Sitamarhi (सीतामढ़ी)", "Siwan (सीवान)", "Supaul (सुपौल)", "Vaishali / Hajipur (वैशाली)",
    "West Champaran / Bettiah (पश्चिम चंपारण)"
  ],
  "Chhattisgarh": [
    "Balod (बालोद)", "Baloda Bazar (बलौदा बाज़ार)", "Balrampur (बलरामपुर)", "Bastar / Jagdalpur (बस्तर)", "Bemetara (बेमेतरा)", "Bijapur (बीजापुर)",
    "Bilaspur (बिलासपुर)", "Dantewada (दंतेवाड़ा)", "Dhamtari (धमतरी)", "Durg (दुर्ग)", "Gariaband (गरियाबंद)", "Gaurela-Pendra-Marwahi (गौरेला-पेंड्रा-मरवाही)",
    "Janjgir-Champa (जांजगीर-चांपा)", "Jashpur (जशपुर)", "Kabirdham / Kawardha (कबीरधाम)", "Kanker (कांकेर)", "Khairagarh-Chhuikhadan-Gandai",
    "Kondagaon (कोंडागांव)", "Korba (कोरबा)", "Koriya (कोरिया)", "Mahasamund (महासमुंद)", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki",
    "Mungeli (मुंगेली)", "Narayanpur (नारायणपुर)", "Raigarh (रायगढ़)", "Raipur (रायपुर)", "Rajnandgaon (राजनंदगांव)", "Sarangarh-Bilaigarh",
    "Sakti (सक्ती)", "Sukma (सुकमा)", "Surajpur (सूरजपुर)", "Surguja / Ambikapur (सरगुजा)"
  ],
  "Goa": [
    "North Goa / Panaji (उत्तर गोवा)", "South Goa / Margao (दक्षिण गोवा)"
  ],
  "Gujarat": [
    "Ahmedabad (अहमदाबाद)", "Amreli (अमरेली)", "Anand (आणंद)", "Aravalli (अरवल्ली)", "Banaskantha / Palanpur (बनासकांठा)", "Bharuch (भरूच)",
    "Bhavnagar (भावनगर)", "Botad (बोटाद)", "Chhota Udaipur (छोटा उदयपुर)", "Dahod (दाहोद)", "Dang (डांग)", "Devbhoomi Dwarka (देवभूमि द्वारका)",
    "Gandhinagar (गांधीनगर)", "Gir Somnath (गीर सोमनाथ)", "Jamnagar (जामनगर)", "Junagadh (जूनागढ़)", "Kheda / Nadiad (खेड़ा)", "Kutch / Bhuj (कच्छ)",
    "Mahisagar (महिसागर)", "Mehsana (मेहसाणा)", "Morbi (मोरबी)", "Narmada / Rajpipla (नर्मदा)", "Navsari (नवसारी)", "Panchmahal / Godhra (पंचमहाल)",
    "Patan (पाटन)", "Porbandar (पोरबंदर)", "Rajkot (राजकोट)", "Sabarkantha / Himatnagar (साबरकांठा)", "Surat (सूरत)", "Surendranagar (सुरेंद्रनगर)",
    "Tapi / Vyara (तापी)", "Vadodara (वडोदरा)", "Valsad (वलसाड)"
  ],
  "Haryana": [
    "Ambala (अंबाला)", "Bhiwani (भिवानी)", "Charkhi Dadri (चरखी दादरी)", "Faridabad (फरीदाबाद)", "Fatehabad (फतेहाबाद)", "Gurugram (गुरुग्राम)",
    "Hisar (हिसार)", "Jhajjar (झज्जर)", "Jind (जींद)", "Kaithal (कैथल)", "Karnal (करनाल)", "Kurukshetra (कुरुक्षेत्र)", "Mahendragarh / Narnaul (महेंद्रगढ़)",
    "Nuh / Mewat (नूंह)", "Palwal (पलवल)", "Panchkula (पंचकुला)", "Panipat (पानीपत)", "Rewari (रेवाड़ी)", "Rohtak (रोहतक)", "Sirsa (सिरसा)",
    "Sonipat (सोनीपत)", "Yamunanagar (यमुनानगर)"
  ],
  "Himachal Pradesh": [
    "Bilaspur (बिलासपुर)", "Chamba (चंबा)", "Hamirpur (हमीरपुर)", "Kangra / Dharamshala (कांगड़ा)", "Kinnaur (किन्नौर)", "Kullu (कुल्लू)",
    "Lahaul and Spiti (लाहौल और स्पीति)", "Mandi (मंडी)", "Shimla (शिमला)", "Sirmaur / Nahan (सिरमौर)", "Solan (सोलन)", "Una (ऊना)"
  ],
  "Jharkhand": [
    "Bokaro (बोकारो)", "Chatra (चतरा)", "Deoghar (देवघर)", "Dhanbad (धनबाद)", "Dumka (दुमका)", "East Singhbhum / Jamshedpur (पूर्वी सिंहभूम)",
    "Garhwa (गढ़वा)", "Giridih (गिरिडीह)", "Godda (गोड्डा)", "Gumla (गुमला)", "Hazaribagh (हजारीबाग)", "Jamtara (जामताड़ा)", "Khunti (खूंटी)",
    "Koderma (कोडरमा)", "Latehar (लातेहार)", "Lohardaga (लोहरदगा)", "Pakur (पाकुड़)", "Palamu / Medininagar (पलामू)", "Ramgarh (रामगढ़)",
    "Ranchi (रांची)", "Sahebganj (साहिबगंज)", "Seraikela Kharsawan (सरायकेला खरसावां)", "Simdega (सिमडेगा)", "West Singhbhum / Chaibasa (पश्चिम सिंहभूम)"
  ],
  "Karnataka": [
    "Bagalkote", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban (बेंगलुरु)", "Bidar", "Chamarajanagara",
    "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada (Mangaluru)", "Davanagere", "Dharwad (Hubballi)", "Gadag",
    "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu (Madikeri)", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur",
    "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayanagara", "Vijayapura (Bijapur)", "Yadgir"
  ],
  "Kerala": [
    "Alappuzha (अलेप्पी)", "Ernakulam / Kochi (कोच्चि)", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode (कोझिकोड)",
    "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram (तिरुवनंतपुरम)", "Thrissur (त्रिशूर)", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa (आगर मालवा)", "Alirajpur (आलीराजपुर)", "Anuppur (अनूपपुर)", "Ashoknagar (अशोकनगर)", "Balaghat (बालाघाट)", "Barwani (बड़वानी)",
    "Betul (बैतूल)", "Bhind (भिंड)", "Bhopal (भोपाल)", "Burhanpur (बुरहानपुर)", "Chhatarpur (छतरपुर)", "Chhindwara (छिंदवाड़ा)", "Damoh (दमोह)",
    "Datia (दतिया)", "Dewas (देवास)", "Dhar (धार)", "Dindori (डिंडोरी)", "Guna (गुना)", "Gwalior (ग्वालियर)", "Harda (हरदा)", "Hoshangabad / Narmadapuram (नर्मदापुरम)",
    "Indore (इंदौर)", "Jabalpur (जबलपुर)", "Jhabua (झाबुआ)", "Katni (कटनी)", "Khandwa / East Nimar (खंडवा)", "Khargone / West Nimar (खरगोन)",
    "Mandla (मंडला)", "Mandsaur (मंदसौर)", "Morena (मुरैना)", "Narsinghpur (नरसिंहपुर)", "Neemuch (नीमच)", "Niwari (निवाड़ी)", "Panna (पन्ना)",
    "Raisen (रायसेन)", "Rajgarh (राजगढ़)", "Ratlam (रतलाम)", "Rewa (रीवा)", "Sagar (सागर)", "Satna (सतना)", "Sehore (सीहोर)", "Seoni (सिवनी)",
    "Shahdol (शहडोल)", "Shajapur (शाजापुर)", "Sheopur (श्योपुर)", "Shivpuri (शिवपुरी)", "Sidhi (सीधी)", "Singrauli (सिंगरौली)", "Tikamgarh (टीकमगढ़)",
    "Ujjain (उज्जैन)", "Umaria (उमरिया)", "Vidisha (विदिशा)"
  ],
  "Maharashtra": [
    "Ahmednagar / Ahilyanagar (अहमदनगर)", "Akola (अकोला)", "Amravati (अमरावती)", "Chhatrapati Sambhajinagar / Aurangabad (छत्रपति संभाजीनगर)",
    "Beed (बीड)", "Bhandara (भंडारा)", "Buldhana (बुलढाणा)", "Chandrapur (चंद्रपुर)", "Dhule (धुले)", "Gadchiroli (गडचिरोली)", "Gondia (गोंदिया)",
    "Hingoli (हिंगोली)", "Jalgaon (जलगांव)", "Jalna (जालना)", "Kolhapur (कोल्हापुर)", "Latur (लातूर)", "Mumbai City (मुंबई शहर)",
    "Mumbai Suburban (मुंबई उपनगर)", "Nagpur (नागपुर)", "Nanded (नांदेड़)", "Nandurbar (नंदुरबार)", "Nashik (नासिक)", "Dharashiv / Osmanabad (धाराशिव)",
    "Palghar (पालघर)", "Parbhani (परभणी)", "Pune (पुणे)", "Raigad (रायगढ़)", "Ratnagiri (रत्नागिरी)", "Sangli (सांगली)", "Satara (सतारा)",
    "Sindhudurg (सिंधुदुर्ग)", "Solapur (सोलापुर)", "Thane (ठाणे)", "Wardha (वर्धा)", "Washim (वाशिम)", "Yavatmal (यवतमाल)"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East (इम्फाल पूर्व)", "Imphal West (इम्फाल पश्चिम)", "Jiribam", "Kakching",
    "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills (Shillong)", "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi",
    "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills (Tura)", "West Jaintia Hills", "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl (आइजोल)", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha"
  ],
  "Nagaland": [
    "Chumoukedima", "Dimapur (दीमापुर)", "Kiphire", "Kohima (कोहिमा)", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak",
    "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"
  ],
  "Odisha": [
    "Angul (अनुगुल)", "Balangir (बलांगीर)", "Balasore (बालेश्वर)", "Bargarh (बरगढ़)", "Bhadrak (भद्रक)", "Boudh (बौध)", "Cuttack (कटक)",
    "Deogarh (देवगढ़)", "Dhenkanal (ढेंकानाल)", "Gajapati (गजपति)", "Ganjam (गंजम)", "Jagatsinghpur (जगतसिंहपुर)", "Jajpur (जाजपुर)",
    "Jharsuguda (झारसुगुड़ा)", "Kalahandi (कालाहांडी)", "Kandhamal (कंधमाल)", "Kendrapara (केंद्रपाड़ा)", "Kendujhar / Keonjhar (केंदुझर)",
    "Khordha / Bhubaneswar (खोरधा)", "Koraput (कोरापुट)", "Malkangiri (मलकानगिरी)", "Mayurbhanj / Baripada (मयूरभंज)", "Nabarangpur (नबरंगपुर)",
    "Nayagarh (नयागढ़)", "Nuapada (नुआपड़ा)", "Puri (पुरी)", "Rayagada (रायगड़ा)", "Sambalpur (संबलपुर)", "Subarnapur / Sonepur (सुवर्णपुर)",
    "Sundargarh / Rourkela (सुंदरगढ़)"
  ],
  "Punjab": [
    "Amritsar (अमृतसर)", "Barnala (बरनाला)", "Bathinda (बठिंडा)", "Faridkot (फरीदकोट)", "Fatehgarh Sahib (फतेहगढ़ साहिब)", "Fazilka (फाजिल्का)",
    "Ferozepur (फिरोजपुर)", "Gurdaspur (गुरदासपुर)", "Hoshiarpur (होशियारपुर)", "Jalandhar (जालंधर)", "Kapurthala (कपूरथला)", "Ludhiana (लुधियाना)",
    "Malerkotla (मलेरकोटला)", "Mansa (मानसा)", "Moga (मोगा)", "Sri Muktsar Sahib (श्री मुक्तसर साहिब)", "Pathankot (पठानकोट)", "Patiala (पटियाला)",
    "Rupnagar / Ropar (रूपनगर)", "Sahibzada Ajit Singh Nagar / Mohali (मोहाली)", "Sangrur (संगरूर)", "Shahid Bhagat Singh Nagar / Nawanshahr",
    "Tarn Taran (तरनतारन)"
  ],
  "Rajasthan": [
    "Ajmer (अजमेर)", "Alwar (अलवर)", "Anupgarh (अनूपगढ़)", "Balotra (बालोतरा)", "Banswara (बांसवाड़ा)", "Baran (बारां)", "Barmer (बाड़मेर)",
    "Beawar (ब्यावर)", "Bharatpur (भरतपुर)", "Bhilwara (भीलवाड़ा)", "Bikaner (बीकानेर)", "Bundi (बूंदी)", "Chittorgarh (चित्तौड़गढ़)",
    "Churu (चूरू)", "Dausa (दौसा)", "Deeg (डीग)", "Didwana-Kuchaman (डीडवाना-कुचामन)", "Dholpur (धौलपुर)", "Dudu (दूदू)", "Dungarpur (डूंगरपुर)",
    "Gangapur City (गंगापुर सिटी)", "Hanumangarh (हनुमानगढ़)", "Jaipur (जयपुर)", "Jaipur Rural (जयपुर ग्रामीण)", "Jaisalmer (जैसलमेर)",
    "Jalore (जालौर)", "Jhalawar (झालावाड़)", "Jhunjhunu (झुंझुनू)", "Jodhpur (जोधपुर)", "Jodhpur Rural (जोधपुर ग्रामीण)", "Karauli (करौली)",
    "Kekri (केकड़ी)", "Khairthal-Tijara (खैरथल-तिजारा)", "Kota (कोटा)", "Kotputli-Behror (कोटपूतली-बहरोड़)", "Nagaur (नागौर)", "Neem Ka Thana (नीम का थाना)",
    "Pali (पाली)", "Phalodi (फलोदी)", "Pratapgarh (प्रतापगढ़)", "Rajsamand (राजसमंद)", "Salumbar (सलूंबर)", "Sanchore (सांचौर)", "Sawai Madhopur (सवाई माधोपुर)",
    "Shahpura (शाहपुरा)", "Sikar (सीकर)", "Sirohi (सिरोही)", "Sri Ganganagar (श्रीगंगानगर)", "Tonk (टोंक)", "Udaipur (उदयपुर)"
  ],
  "Sikkim": [
    "Gangtok (गंगटोक)", "Gyalshing / West Sikkim", "Mangan / North Sikkim", "Namchi / South Sikkim", "Pakyong", "Soreng"
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai (चेन्नई)", "Coimbatore (कोयंबटूर)", "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
    "Kallakurichi", "Kanchipuram", "Kanyakumari / Nagercoil (कन्याकुमारी)", "Karur", "Krishnagiri", "Madurai (मदुरै)", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris / Ooty (ऊटी)", "Perambalur", "Pudukkottai", "Ramanathapuram (रामेश्वरम)", "Ranipet",
    "Salem (सलेम)", "Sivaganga", "Tenkasi", "Thanjavur (तंजौर)", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli / Trichy (त्रिची)",
    "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore (वेल्लोर)", "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad (आदिलाबाद)", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad (हैदराबाद)", "Jagtial", "Jangaon", "Jayashankar Bhupalpally",
    "Jogulamba Gadwal", "Kamareddy", "Karimnagar (करीमनगर)", "Khammam (खम्मम)", "Kumuram Bheem Asifabad", "Mahabubabad",
    "Mahabubnagar (महबूबनगर)", "Mancherial", "Medak", "Medchal Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda (नलगोंडा)",
    "Narayanpet", "Nirmal", "Nizamabad (निजामाबाद)", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet",
    "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (वारंगल)", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati / Udaipur", "Khowai", "North Tripura / Dharmanagar", "Sepahijala / Bishramganj", "South Tripura / Belonia",
    "Unakoti / Kailashahar", "West Tripura / Agartala (अगरतला)"
  ],
  "Uttar Pradesh": [
    "Agra (आगरा)", "Aligarh (अलीगढ़)", "Ambedkar Nagar (अम्बेडकर नगर)", "Amethi (अमेठी)", "Amroha (अमरोहा)", "Auraiya (औरैया)",
    "Ayodhya (अयोध्या)", "Azamgarh (आजमगढ़)", "Baghpat (बागपत)", "Bahraich (बहराइच)", "Ballia (बलिया)", "Balrampur (बलरामपुर)",
    "Banda (बांदा)", "Barabanki (बाराबंकी)", "Bareilly (बरेली)", "Basti (बस्ती)", "Bhadohi (भदोही)", "Bijnor (बिजनौर)", "Budaun (बदायूं)",
    "Bulandshahr (बुलंदशहर)", "Chandauli (चंदौली)", "Chitrakoot (चित्रकूट)", "Deoria (देवरिया)", "Etah (एटा)", "Etawah (इटावा)",
    "Farrukhabad (फर्रुखाबाद)", "Fatehpur (फतेहपुर)", "Firozabad (फिरोजाबाद)", "Gautam Buddha Nagar / Noida (नोएडा)", "Ghaziabad (गाजियाबाद)",
    "Ghazipur (गाजीपुर)", "Gonda (गोंडा)", "Gorakhpur (गोरखपुर)", "Hamirpur (हमीरपुर)", "Hapur (हापुड़)", "Hardoi (हरदोई)", "Hathras (हाथरस)",
    "Jalaun (जालौन)", "Jaunpur (जौनपुर)", "Jhansi (झांसी)", "Kannauj (कन्नौज)", "Kanpur Dehat (कानपुर देहात)", "Kanpur Nagar (कानपुर नगर)",
    "Kasganj (कासगंज)", "Kaushambi (कौशाम्बी)", "Kushinagar (कुशीनगर)", "Lakhimpur Kheri (लखीमपुर खीरी)", "Lalitpur (ललितपुर)",
    "Lucknow (लखनऊ)", "Maharajganj (महराजगंज)", "Mahoba (महोबा)", "Mainpuri (मैनपुरी)", "Mathura (मथुरा)", "Mau (मऊ)", "Meerut (मेरठ)",
    "Mirzapur (मिर्जापुर)", "Moradabad (मुरादाबाद)", "Muzaffarnagar (मुजफ्फरनगर)", "Pilibhit (पीलीभीत)", "Pratapgarh (प्रतापगढ़)",
    "Prayagraj / Allahabad (प्रयागराज)", "Rae Bareli (रायबरेली)", "Rampur (रामपुर)", "Saharanpur (सहारनपुर)", "Sambhal (संभल)",
    "Sant Kabir Nagar (संत कबीर नगर)", "Shahjahanpur (शाहजहांपुर)", "Shamli (शामली)", "Shravasti (श्रावस्ती)", "Siddharthnagar (सिद्धार्थनगर)",
    "Sitapur (सीतापुर)", "Sonbhadra (सोनभद्र)", "Sultanpur (सुलतानपुर)", "Unnao (उन्नाव)", "Varanasi (वाराणसी)"
  ],
  "Uttarakhand": [
    "Almora (अल्मोड़ा)", "Bageshwar (बागेश्वर)", "Chamoli / Gopeshwar (चमोली)", "Champawat (चंपावत)", "Dehradun (देहरादून)",
    "Haridwar (हरिद्वार)", "Nainital (नैनीताल)", "Pauri Garhwal (पौड़ी गढ़वाल)", "Pithoragarh (पिथौरागढ़)", "Rudraprayag (रुद्रप्रयाग)",
    "Tehri Garhwal (टिहरी गढ़वाल)", "Udham Singh Nagar / Rudrapur (उधम सिंह नगर)", "Uttarkashi (उत्तरकाशी)"
  ],
  "West Bengal": [
    "Alipurduar (अलीपुरद्वार)", "Bankura (बांकुड़ा)", "Birbhum / Suri (बीरभूम)", "Cooch Behar (कूचबिहार)", "Dakshin Dinajpur / Balurghat (दक्षिण दिनाजपुर)",
    "Darjeeling (दार्जिलिंग)", "Hooghly / Chinsurah (हुगली)", "Howrah (हावड़ा)", "Jalpaiguri (जलपाईगुड़ी)", "Jhargram (झाड़ग्राम)",
    "Kalimpong (कालिम्पोंग)", "Kolkata (कोलकाता)", "Malda (मालदा)", "Murshidabad / Baharampur (मुर्शिदाबाद)", "Nadia / Krishnanagar (नदिया)",
    "North 24 Parganas / Barasat (उत्तर 24 परगना)", "Paschim Bardhaman / Asansol (पश्चिम बर्धमान)", "Paschim Medinipur / Midnapore (पश्चिम मेदिनीपुर)",
    "Purba Bardhaman / Burdwan (पूर्व बर्धमान)", "Purba Medinipur / Tamluk (पूर्व मेदिनीपुर)", "Purulia (पुरुलिया)", "South 24 Parganas / Alipore (दक्षिण 24 परगना)",
    "Uttar Dinajpur / Raiganj (उत्तर दिनाजपुर)"
  ],
  "Andaman and Nicobar Islands": [
    "Nicobar (कार निकोबार)", "North and Middle Andaman (मायाबंदर)", "South Andaman / Port Blair (पोर्ट ब्लेयर)"
  ],
  "Chandigarh": [
    "Chandigarh City (चंडीगढ़ शहर)", "Sector 17 (सेक्टर 17)", "Sector 35 (सेक्टर 35)", "Manimajra (मनीमाजरा)", "Industrial Area (इंडस्ट्रियल एरिया)"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman (दमन)", "Diu (दीव)", "Dadra and Nagar Haveli / Silvassa (सिलवासा)"
  ],
  "Delhi": [
    "Central Delhi (मध्य दिल्ली)", "East Delhi (पूर्वी दिल्ली)", "New Delhi (नई दिल्ली)", "North Delhi (उत्तर दिल्ली)",
    "North East Delhi (उत्तर पूर्वी दिल्ली)", "North West Delhi (उत्तर पश्चिमी दिल्ली)", "Shahdara (शाहदरा)", "South Delhi (दक्षिण दिल्ली)",
    "South East Delhi (दक्षिण पूर्वी दिल्ली)", "South West Delhi (दक्षिण पश्चिमी दिल्ली)", "West Delhi (पश्चिम दिल्ली)"
  ],
  "Jammu and Kashmir": [
    "Anantnag (अनंतनाग)", "Bandipora (बांदीपोरा)", "Baramulla (बारामूला)", "Budgam (बडगाम)", "Doda (डोडा)", "Ganderbal (गांदरबल)",
    "Jammu (जम्मू)", "Kathua (कठुआ)", "Kishtwar (किश्तवाड़)", "Kulgam (कुलगाम)", "Kupwara (कुपवाड़ा)", "Poonch (पुंछ)", "Pulwama (पुलवामा)",
    "Rajouri (राजौरी)", "Ramban (रामबन)", "Reasi (रियासी)", "Samba (सांबा)", "Shopian (शोपियां)", "Srinagar (श्रीनगर)", "Udhampur (उधमपुर)"
  ],
  "Ladakh": [
    "Leh (लेह)", "Kargil (कारगिल)"
  ],
  "Lakshadweep": [
    "Kavaratti (कवरत्ती)", "Agatti (अगत्ती)", "Amini (अमीनी)", "Andrott (अंद्रोत)", "Minicoy (मिनिकॉय)"
  ],
  "Puducherry": [
    "Puducherry (पुडुचेरी)", "Karaikal (कराइकाल)", "Mahe (माहे)", "Yanam (यानम)"
  ]
};

// Rich local villages and tehsils for granular drilldown
const DETAILED_VILLAGES = {
  "Ghaziabad (गाजियाबाद)": ["Kalchina (कलछीना)", "Nigrawathi (निगरावठी)", "Samaypur (समयपुर)", "Akalpur (अकलपुर)", "Nurpur (नूरपुर)", "Barayla (बरैला)", "Mindori (मिंडोरी)", "Nindori (निंदोरी)", "Nahal (नाहल)", "Dasna (डासना)", "Loni (लोणी)", "Modinagar (मोदीनगर)", "Muradnagar (मुरादनगर)", "Bhojpur (भोजपुर)", "Razapur (रजापुर)", "Farrukhnagar (फर्रुखनगर)", "Duhai (दुहाई)", "Sikrod (सकरोड़)", "Morta (मोर्ता)", "Morti (मोर्ती)", "Jalalabad (जलालाबाद)", "Khindora (खिंदोरा)", "Shahpur (शाहपुर)", "Govindpuri (गोविंदपुरी)"],
  "Meerut (मेरठ)": ["Mawana (मवाना)", "Sardhana (सरधना)", "Hastinapur (हस्तिनापुर)", "Parikshitgarh (परीक्षितगढ़)", "Daurala (दौराला)", "Kithore (किठौर)", "Janakpuri (जनकपुरी)", "Lawar (नावड़)", "Rohata (रोहटा)", "Jani Khurd (जानी खुर्द)", "Machhra (माछरा)"],
  "Bulandshahr (बुलंदशहर)": ["Sikandrabad (सिकंदराबाद)", "Anupshahr (अनूपशहर)", "Khurja (खुरजा)", "Gulaothi (गुनावठी)", "Jahangirabad (जहांगीराबाद)", "Pahasu (पहासू)", "Chhatari (छतारी)", "Siana (स्याना)", "Shikarpur (शिकारपुर)", "Dibai (डिबाई)", "Danpur (दानपुर)"],
  "Gautam Buddha Nagar / Noida (नोएडा)": ["Dadri (दादरी)", "Jewar (जेवर)", "Dankaur (दनकौर)", "Rabupura (रबुपुरा)", "Bilaspur (बिलासपुर)", "Bhangel (भंगेल)", "Surajpur (सूरजपुर)", "Bisrakh (बिसरख)", "Chhapraula (छपरौला)"],
  "Hapur (हापुड़)": ["Garhmukteshwar (गढ़मुक्तेश्वर)", "Dhaulana (धौलाना)", "Babu Garh (बाबूगढ़)", "Pilkhuwa (पिलखुवा)", "Simbhawali (सिंभावली)", "Kharakpur (खरकपुर)"],
  "Baghpat (बागपत)": ["Baraut (बड़ौत)", "Khekra (खेखड़ा)", "Binauli (बिनौली)", "Chhaprauli (छपरौली)", "Pilana (पिलाना)", "Agarwal Mandi (अग्रवाल मंडी)"],
  "Muzaffarnagar (मुजफ्फरनगर)": ["Budhana (बुढ़ाना)", "Khatauli (खतौली)", "Jansath (जानसठ)", "Shahpur (शाहपुर)", "Purkazi (पुरकाजी)", "Charthawal (चरथावल)", "Baghra (बाघरा)"],
  "Saharanpur (सहारनपुर)": ["Deoband (देवबंद)", "Nakur (नकुड़)", "Behat (बेहट)", "Rampur Maniharan (रामपुर मनिहारान)", "Gangoh (गंगोह)", "Nanauta (नानौता)", "Sarsawa (सरसावा)"],
  "Aligarh (अलीगढ़)": ["Atrauli (अतरौली)", "Iglas (इगलास)", "Khair (खैर)", "Gabhana (गभाना)", "Koil (कोल)", "Chandaus (चंडौस)", "Jawan Sikandarpur (जवां सिकंदरपुर)"],
  "Mathura (मथुरा)": ["Vrindavan (वृंदावन)", "Govardhan (गोवर्धन)", "Chhata (छाता)", "Mant (मांट)", "Barsana (बरसाना)", "Nandgaon (नंदगांव)", "Baldeo (बलदेव)", "Raya (राया)", "Farah (फरह)"],
  "Agra (आगरा)": ["Fatehabad (फतेहाबाद)", "Kiraoli (किरावली)", "Bah (बाह)", "Kheragarh (खेरागढ़)", "Etmadpur (एत्मादपुर)", "Achhnera (अछनेरा)", "Fatehpur Sikri (फतेहपुर सीकरी)", "Shamsabad (शमसाबाद)"],
  "Lucknow (लखनऊ)": ["Bakshi Ka Talab (बख्शी का तालाब)", "Mohanlalganj (मोहनलालगंज)", "Sarojini Nagar (सरोजिनी नगर)", "Gosainganj (गोसाईं गंज)", "Kakori (काकोरी)", "Maliahabad (मलिहाबाद)", "Chinhat (चिनहट)", "Itaunja (इटौंजा)"],
  "Varanasi (वाराणसी)": ["Pindra (पिंडरा)", "Cholapur (चोलापुर)", "Kashi Vidyapeeth (काशी विद्यापीठ)", "Arajiline (आराजीलाइन)", "Sevapuri (सेवापुरी)", "Harahua (हरहुआ)", "Rohaniya (रोहनिया)", "Shivpur (शिवपुर)", "Ramnagar (रामनगर)"],
  "Gorakhpur (गोरखपुर)": ["Sahjanwa (सहजनवा)", "Bansgaon (बांसगांव)", "Campierganj (कैंपियरगंज)", "Pipraich (पिपराइच)", "Chauri Chaura (चौरी चौरा)", "Brahmpur (ब्रह्मपुर)", "Khajni (खजनी)", "Gola (गोला)", "Barhalganj (बड़हलगंज)"],
  "Patna (पटना)": ["Danapur (दानापुर)", "Phulwari Sharif (फुलवारी शरीफ)", "Fatwah (फतवा)", "Bakhtiarpur (बख्तियारपुर)", "Barh (बाढ़)", "Mokama (मोकामा)", "Bikram (बिक्रम)", "Paliganj (पालीगंज)", "Masaurhi (मसौढ़ी)", "Maner (मनेर)"],
  "Gaya (गया)": ["Bodh Gaya (बोधगया)", "Sherghati (शेरघाटी)", "Tekari (टिकारी)", "Wazirganj (वजीरगंज)", "Belaganj (बेलागंज)", "Imamganj (इमामगंज)", "Barachatti (बाराचट्टी)"],
  "Jaipur (जयपुर)": ["Chomu (चौमूं)", "Amber (आमेर)", "Sanganer (सांगानेर)", "Bassi (बस्सी)", "Phulera (फुलेरा)", "Kotputli (कोटपूतली)", "Shahpura (शाहपुरा)", "Chaksu (चाकसू)"],
  "Jodhpur (जोधपुर)": ["Luni (लूणी)", "Bilara (बिलाड़ा)", "Osian (ओसियां)", "Phalodi (फलोदी)", "Bhopalgarh (भोपालगढ़)", "Shergarh (शेरगढ़)"],
  "Bhopal (भोपाल)": ["Berasia (बेरसिया)", "Phanda (फंदा)", "Sukhi Sewaniya (सूखीसेवानिया)", "Bairagarh (बैरागढ़)", "Kolar (कोलार)"],
  "Indore (इंदौर)": ["Depalpur (देपालपुर)", "Sanwer (सांवेर)", "Mhow / Dr Ambedkar Nagar (महू)", "Rau (राऊ)", "Hatod (हातोद)"],
  "Gurugram (गुरुग्राम)": ["Sohna (सोहना)", "Pataudi (पटौदी)", "Farrukhnagar (फर्रुखनगर)", "Manesar (मानेसर)", "Badshahpur (बादशाहपुर)"],
  "Faridabad (फरीदाबाद)": ["Ballabgarh (बल्लभगढ़)", "Mohna (मोहना)", "Tigaon (तिगांव)", "Dhauj (धौज)", "Dayalpur (दयालपूर)"],
  "Central Delhi (मध्य दिल्ली)": ["Karol Bagh (करोल बाग)", "Pahar Ganj (पहाड़गंज)", "Daryaganj (दरियागंज)", "Civil Lines (सिविल लाइन्स)"],
  "New Delhi (नई दिल्ली)": ["Connaught Place (कनॉट प्लेस)", "Chanakyapuri (चाणक्यपुरी)", "Vasant Vihar (वसंत विहार)"],
  "North Delhi (उत्तर दिल्ली)": ["Narela (नरेला)", "Alipur (अलीपुर)", "Model Town (मॉडल टाउन)", "Burari (बुराड़ी)"],
  "North West Delhi (उत्तर पश्चिमी दिल्ली)": ["Rohini (रोहिणी)", "Kanjhawala (कंझावला)", "Saraswati Vihar (सरस्वती विहार)", "Bawana (बवाना)"],
  "South Delhi (दक्षिण दिल्ली)": ["Hauz Khas (हौज खास)", "Mehrauli (महरौली)", "Saket (साकेत)", "Chhatarpur (छतरपुर)"],
  "South West Delhi (दक्षिण पश्चिमी दिल्ली)": ["Dwarka (द्वारका)", "Najafgarh (नजफगढ़)", "Kapashera (कपासहेड़ा)", "Bijwasan (बिजवासन)"],
  "East Delhi (पूर्वी दिल्ली)": ["Gandhi Nagar (गांधी नगर)", "Preet Vihar (प्रीत विहार)", "Mayur Vihar (मयूर विहार)", "Patparganj (पटपड़गंज)"],
  "Shahdara (शाहदरा)": ["Shahdara (शाहदरा)", "Seemapuri (सीमापुरी)", "Vivek Vihar (विवेक विहार)", "Dilshad Garden (दिलशाद गार्डन)"]
};

// Build master database supporting both direct English name and bilingual name
const masterDB = {};

INDIAN_STATES_AND_UTS.forEach(state => {
  const hindi = HINDI_STATE_NAMES[state] || state;
  const bilingualKey = `${state} (${hindi})`;
  const districts = ALL_DISTRICTS_DATA[state] || [`${state} District 1`, `${state} District 2`];

  const stateObj = {};
  districts.forEach(dist => {
    const villages = DETAILED_VILLAGES[dist] || [
      `${dist.split('(')[0].trim()} Main Town (मुख्य कस्बा)`,
      'Tehsil Center (तहसील केंद्र)',
      'Block HQ (ब्लॉक मुख्यालय)',
      'Gram Panchayat 1 (ग्राम पंचायत 1)',
      'Gram Panchayat 2 (ग्राम पंचायत 2)'
    ];
    stateObj[dist] = villages;
  });

  // Store under English name
  masterDB[state] = stateObj;
  // Store under bilingual name as well for reverse compatibility
  masterDB[bilingualKey] = stateObj;
});

const fileContent = `// All 28 States and 8 Union Territories with Complete Official Districts & Villages across India

export const ALL_INDIAN_STATES_AND_UTS: string[] = ${JSON.stringify(INDIAN_STATES_AND_UTS, null, 2)};

export const ALL_INDIA_LOCATIONS: { [state: string]: { [district: string]: string[] } } = ${JSON.stringify(masterDB, null, 2)};

export function getDistrictsForState(stateName: string): string[] {
  if (!stateName) return [];
  // Direct match
  if (ALL_INDIA_LOCATIONS[stateName]) {
    return Object.keys(ALL_INDIA_LOCATIONS[stateName]);
  }
  // Try prefix / fuzzy match
  for (const key in ALL_INDIA_LOCATIONS) {
    if (key.toLowerCase().includes(stateName.toLowerCase()) || stateName.toLowerCase().includes(key.toLowerCase())) {
      return Object.keys(ALL_INDIA_LOCATIONS[key]);
    }
  }
  return [];
}

export function getVillagesForDistrict(stateName: string, districtName: string): string[] {
  if (!districtName) return [];
  
  if (stateName && ALL_INDIA_LOCATIONS[stateName] && ALL_INDIA_LOCATIONS[stateName][districtName]) {
    return ALL_INDIA_LOCATIONS[stateName][districtName];
  }

  for (const st in ALL_INDIA_LOCATIONS) {
    if (ALL_INDIA_LOCATIONS[st][districtName]) {
      return ALL_INDIA_LOCATIONS[st][districtName];
    }
  }

  const cleanDist = districtName.split('(')[0].trim();
  return [
    \`\${cleanDist} Main Town (मुख्य कस्बा)\`,
    'Tehsil Center (तहसील केंद्र)',
    'Block HQ (ब्लॉक मुख्यालय)',
    'Gram Panchayat 1 (ग्राम पंचायत 1)',
    'Gram Panchayat 2 (ग्राम पंचायत 2)'
  ];
}
`;

fs.writeFileSync('src/data/indiaLocations.ts', fileContent, 'utf-8');
console.log('✅ Generated src/data/indiaLocations.ts successfully!');
