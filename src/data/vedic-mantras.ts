export interface VedicMantra {
    id: string;
    sanskrit: string;
    transliteration: string;
    meaning: string;
    usage: string;
}

export const vedicMantras: Record<string, VedicMantra> = {
    annapurna: {
        id: 'annapurna',
        sanskrit: "अन्नपूर्णे सदापूर्णे शङ्करप्राणवल्लभे। ज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥",
        transliteration: "Annapūrṇe sadāpūrṇe śaṅkaraprāṇavallabhe, Jñānavairāgyasiddhyarthaṃ bhikṣāṃ dehi ca pārvati",
        meaning: "O Goddess Annapurna, who is eternally complete, beloved of Lord Shiva, grant me the alms of knowledge and detachment, O Parvati.",
        usage: "Recite before cooking to invoke the grace of nourishment."
    },

    brahmarpanam: {
        id: 'brahmarpanam',
        sanskrit: "ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्। ब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥",
        transliteration: "Brahmārpaṇaṃ brahma havirbrahm āgnau brahmaṇā hutam, Brahmaiva tena gantavyaṃ brahmakarmasamādhinā",
        meaning: "The act of offering is God, the oblation is God, offered by God into the fire of God. God is attained by him who sees the action of God in everything.",
        usage: "Traditional prayer chanted before eating meals."
    },

    bhojanMantra: {
        id: 'bhojanMantra',
        sanskrit: "अहं वैश्वानरो भूत्वा प्राणिनां देहमाश्रितः। प्राणापानसमायुक्तः पचाम्यन्नं चतुर्विधम्॥",
        transliteration: "Ahaṃ vaiśvānaro bhūtvā prāṇināṃ dehamāśritaḥ, Prāṇāpānasamāyuktaḥ pacāmyannaṃ caturvidham",
        meaning: "I, having become the fire of digestion dwelling in the bodies of living beings, united with prana and apana, digest the four kinds of food.",
        usage: "Acknowledges the divine digestive fire within."
    },

    annadanam: {
        id: 'annadanam',
        sanskrit: "अन्नदानं परं दानं विद्यादानमतः परम्। अन्नेन धार्यते प्राणो विद्यया परमं पदम्॥",
        transliteration: "Annadānaṃ paraṃ dānaṃ vidyādānamataḥ param, Annena dhāryate prāṇo vidyayā paramaṃ padam",
        meaning: "The gift of food is the highest gift, followed by the gift of knowledge. Life is sustained by food, and the supreme state is attained through knowledge.",
        usage: "Reflecting on the importance of sharing food."
    },

    gayatriMantra: {
        id: 'gayatriMantra',
        sanskrit: "ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥",
        transliteration: "Om Bhūr Bhuvaḥ Svaḥ, Tat Savitur Vareṇyaṃ Bhargo Devasya Dhīmahi, Dhiyo Yo Naḥ Pracodayāt",
        meaning: "We meditate on the divine light of the supreme creator. May that illuminate our minds.",
        usage: "A universal prayer for enlightenment and wisdom."
    },

    shantiMantra: {
        id: 'shantiMantra',
        sanskrit: "ॐ सह नाववतु । सह नौ भुनक्तु । सह वीर्यं करवावहै । तेजस्वि नावधीतमस्तु मा विद्विषावहै ॥",
        transliteration: "Om Saha Navavatu, Saha Nau Bhunaktu, Saha Veeryam Karavavahai, Tejasvi Navadheetamastu Ma Vidvishavahai.",
        meaning: "May He protect us both; may He nourish us both; may we work together with great energy; may our study be vigorous and effective; may we not dispute.",
        usage: "Prayer for peace and togetherness."
    },

    gitaSattvic: {
        id: 'gitaSattvic',
        sanskrit: "आयुःसत्त्वबलारोग्यसुखप्रीतिविवर्धनाः। रस्याः स्निग्धाः स्थिरा हृद्या आहाराः सात्त्विकप्रियाः॥",
        transliteration: "āyuḥ-sattva-balārogya-sukha-prīti-vivardhanāḥ, rasyāḥ snigdhāḥ sthirā hṛdyā āhārāḥ sāttvika-priyāḥ",
        meaning: "Foods that increase life, purity, strength, health, happiness, and satisfaction, which are succulent, fatty, substantial, and agreeable, are dear to those in the mode of goodness.",
        usage: "Gita 17.8 - Description of Sattvic food."
    },

    digestionMantra: {
        id: 'digestionMantra',
        sanskrit: "अन्नं ब्रह्मा रसो विष्णुः भोक्ता देवो जनार्दनः।",
        transliteration: "Annam Brahma Raso Vishnuh Bhokta Devo Janardanah",
        meaning: "Food is Brahma, the essence is Vishnu, and the consumer is Janardana (Shiva).",
        usage: "Acknowledges the divine in every aspect of eating."
    }
};
