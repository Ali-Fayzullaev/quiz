// Готовые наборы слов по категориям
// Формат: { word, translation, transcription }

const wordSets = {
  // Общие/базовые слова
  general: {
    en_ru: [
      { word: 'hello', translation: 'привет', transcription: '[həˈləʊ]' },
      { word: 'goodbye', translation: 'до свидания', transcription: '[ˌɡʊdˈbaɪ]' },
      { word: 'please', translation: 'пожалуйста', transcription: '[pliːz]' },
      { word: 'thank you', translation: 'спасибо', transcription: '[θæŋk juː]' },
      { word: 'yes', translation: 'да', transcription: '[jes]' },
      { word: 'no', translation: 'нет', transcription: '[nəʊ]' },
      { word: 'sorry', translation: 'извините', transcription: '[ˈsɒri]' },
      { word: 'help', translation: 'помощь', transcription: '[help]' },
      { word: 'time', translation: 'время', transcription: '[taɪm]' },
      { word: 'day', translation: 'день', transcription: '[deɪ]' },
      { word: 'night', translation: 'ночь', transcription: '[naɪt]' },
      { word: 'morning', translation: 'утро', transcription: '[ˈmɔːnɪŋ]' },
      { word: 'evening', translation: 'вечер', transcription: '[ˈiːvnɪŋ]' },
      { word: 'today', translation: 'сегодня', transcription: '[təˈdeɪ]' },
      { word: 'tomorrow', translation: 'завтра', transcription: '[təˈmɒrəʊ]' },
      { word: 'yesterday', translation: 'вчера', transcription: '[ˈjestədeɪ]' },
      { word: 'week', translation: 'неделя', transcription: '[wiːk]' },
      { word: 'month', translation: 'месяц', transcription: '[mʌnθ]' },
      { word: 'year', translation: 'год', transcription: '[jɪə]' },
      { word: 'name', translation: 'имя', transcription: '[neɪm]' },
      { word: 'friend', translation: 'друг', transcription: '[frend]' },
      { word: 'family', translation: 'семья', transcription: '[ˈfæməli]' },
      { word: 'home', translation: 'дом', transcription: '[həʊm]' },
      { word: 'work', translation: 'работа', transcription: '[wɜːk]' },
      { word: 'love', translation: 'любовь', transcription: '[lʌv]' },
      { word: 'life', translation: 'жизнь', transcription: '[laɪf]' },
      { word: 'world', translation: 'мир', transcription: '[wɜːld]' },
      { word: 'people', translation: 'люди', transcription: '[ˈpiːpl]' },
      { word: 'water', translation: 'вода', transcription: '[ˈwɔːtə]' },
      { word: 'food', translation: 'еда', transcription: '[fuːd]' }
    ]
  },

  // Бизнес
  business: {
    en_ru: [
      { word: 'meeting', translation: 'встреча', transcription: '[ˈmiːtɪŋ]' },
      { word: 'contract', translation: 'контракт', transcription: '[ˈkɒntrækt]' },
      { word: 'company', translation: 'компания', transcription: '[ˈkʌmpəni]' },
      { word: 'manager', translation: 'менеджер', transcription: '[ˈmænɪdʒə]' },
      { word: 'salary', translation: 'зарплата', transcription: '[ˈsæləri]' },
      { word: 'deadline', translation: 'крайний срок', transcription: '[ˈdedlaɪn]' },
      { word: 'budget', translation: 'бюджет', transcription: '[ˈbʌdʒɪt]' },
      { word: 'profit', translation: 'прибыль', transcription: '[ˈprɒfɪt]' },
      { word: 'loss', translation: 'убыток', transcription: '[lɒs]' },
      { word: 'investment', translation: 'инвестиция', transcription: '[ɪnˈvestmənt]' },
      { word: 'partnership', translation: 'партнёрство', transcription: '[ˈpɑːtnəʃɪp]' },
      { word: 'negotiation', translation: 'переговоры', transcription: '[nɪˌɡəʊʃiˈeɪʃn]' },
      { word: 'agreement', translation: 'соглашение', transcription: '[əˈɡriːmənt]' },
      { word: 'client', translation: 'клиент', transcription: '[ˈklaɪənt]' },
      { word: 'customer', translation: 'покупатель', transcription: '[ˈkʌstəmə]' },
      { word: 'employee', translation: 'сотрудник', transcription: '[ɪmˈplɔɪiː]' },
      { word: 'employer', translation: 'работодатель', transcription: '[ɪmˈplɔɪə]' },
      { word: 'invoice', translation: 'счёт-фактура', transcription: '[ˈɪnvɔɪs]' },
      { word: 'revenue', translation: 'доход', transcription: '[ˈrevənjuː]' },
      { word: 'strategy', translation: 'стратегия', transcription: '[ˈstrætədʒi]' },
      { word: 'marketing', translation: 'маркетинг', transcription: '[ˈmɑːkɪtɪŋ]' },
      { word: 'sales', translation: 'продажи', transcription: '[seɪlz]' },
      { word: 'report', translation: 'отчёт', transcription: '[rɪˈpɔːt]' },
      { word: 'presentation', translation: 'презентация', transcription: '[ˌpreznˈteɪʃn]' },
      { word: 'schedule', translation: 'расписание', transcription: '[ˈʃedjuːl]' }
    ]
  },

  // Путешествия
  travel: {
    en_ru: [
      { word: 'airport', translation: 'аэропорт', transcription: '[ˈeəpɔːt]' },
      { word: 'flight', translation: 'рейс', transcription: '[flaɪt]' },
      { word: 'ticket', translation: 'билет', transcription: '[ˈtɪkɪt]' },
      { word: 'passport', translation: 'паспорт', transcription: '[ˈpɑːspɔːt]' },
      { word: 'hotel', translation: 'отель', transcription: '[həʊˈtel]' },
      { word: 'reservation', translation: 'бронирование', transcription: '[ˌrezəˈveɪʃn]' },
      { word: 'luggage', translation: 'багаж', transcription: '[ˈlʌɡɪdʒ]' },
      { word: 'suitcase', translation: 'чемодан', transcription: '[ˈsuːtkeɪs]' },
      { word: 'departure', translation: 'отправление', transcription: '[dɪˈpɑːtʃə]' },
      { word: 'arrival', translation: 'прибытие', transcription: '[əˈraɪvl]' },
      { word: 'boarding pass', translation: 'посадочный талон', transcription: '[ˈbɔːdɪŋ pɑːs]' },
      { word: 'gate', translation: 'выход (на посадку)', transcription: '[ɡeɪt]' },
      { word: 'customs', translation: 'таможня', transcription: '[ˈkʌstəmz]' },
      { word: 'visa', translation: 'виза', transcription: '[ˈviːzə]' },
      { word: 'tourist', translation: 'турист', transcription: '[ˈtʊərɪst]' },
      { word: 'map', translation: 'карта', transcription: '[mæp]' },
      { word: 'guide', translation: 'гид', transcription: '[ɡaɪd]' },
      { word: 'excursion', translation: 'экскурсия', transcription: '[ɪkˈskɜːʃn]' },
      { word: 'beach', translation: 'пляж', transcription: '[biːtʃ]' },
      { word: 'mountain', translation: 'гора', transcription: '[ˈmaʊntɪn]' },
      { word: 'museum', translation: 'музей', transcription: '[mjuːˈziːəm]' },
      { word: 'restaurant', translation: 'ресторан', transcription: '[ˈrestrɒnt]' },
      { word: 'taxi', translation: 'такси', transcription: '[ˈtæksi]' },
      { word: 'train', translation: 'поезд', transcription: '[treɪn]' },
      { word: 'bus', translation: 'автобус', transcription: '[bʌs]' }
    ]
  },

  // Еда
  food: {
    en_ru: [
      { word: 'breakfast', translation: 'завтрак', transcription: '[ˈbrekfəst]' },
      { word: 'lunch', translation: 'обед', transcription: '[lʌntʃ]' },
      { word: 'dinner', translation: 'ужин', transcription: '[ˈdɪnə]' },
      { word: 'appetizer', translation: 'закуска', transcription: '[ˈæpɪtaɪzə]' },
      { word: 'dessert', translation: 'десерт', transcription: '[dɪˈzɜːt]' },
      { word: 'menu', translation: 'меню', transcription: '[ˈmenjuː]' },
      { word: 'waiter', translation: 'официант', transcription: '[ˈweɪtə]' },
      { word: 'bill', translation: 'счёт', transcription: '[bɪl]' },
      { word: 'tip', translation: 'чаевые', transcription: '[tɪp]' },
      { word: 'bread', translation: 'хлеб', transcription: '[bred]' },
      { word: 'meat', translation: 'мясо', transcription: '[miːt]' },
      { word: 'fish', translation: 'рыба', transcription: '[fɪʃ]' },
      { word: 'chicken', translation: 'курица', transcription: '[ˈtʃɪkɪn]' },
      { word: 'vegetables', translation: 'овощи', transcription: '[ˈvedʒtəblz]' },
      { word: 'fruit', translation: 'фрукты', transcription: '[fruːt]' },
      { word: 'salad', translation: 'салат', transcription: '[ˈsæləd]' },
      { word: 'soup', translation: 'суп', transcription: '[suːp]' },
      { word: 'rice', translation: 'рис', transcription: '[raɪs]' },
      { word: 'pasta', translation: 'паста', transcription: '[ˈpæstə]' },
      { word: 'cheese', translation: 'сыр', transcription: '[tʃiːz]' },
      { word: 'egg', translation: 'яйцо', transcription: '[eɡ]' },
      { word: 'milk', translation: 'молоко', transcription: '[mɪlk]' },
      { word: 'coffee', translation: 'кофе', transcription: '[ˈkɒfi]' },
      { word: 'tea', translation: 'чай', transcription: '[tiː]' },
      { word: 'juice', translation: 'сок', transcription: '[dʒuːs]' }
    ]
  },

  // Технологии
  technology: {
    en_ru: [
      { word: 'computer', translation: 'компьютер', transcription: '[kəmˈpjuːtə]' },
      { word: 'laptop', translation: 'ноутбук', transcription: '[ˈlæptɒp]' },
      { word: 'smartphone', translation: 'смартфон', transcription: '[ˈsmɑːtfəʊn]' },
      { word: 'tablet', translation: 'планшет', transcription: '[ˈtæblət]' },
      { word: 'software', translation: 'программное обеспечение', transcription: '[ˈsɒftweə]' },
      { word: 'hardware', translation: 'аппаратное обеспечение', transcription: '[ˈhɑːdweə]' },
      { word: 'application', translation: 'приложение', transcription: '[ˌæplɪˈkeɪʃn]' },
      { word: 'website', translation: 'веб-сайт', transcription: '[ˈwebsaɪt]' },
      { word: 'internet', translation: 'интернет', transcription: '[ˈɪntənet]' },
      { word: 'download', translation: 'скачать', transcription: '[ˌdaʊnˈləʊd]' },
      { word: 'upload', translation: 'загрузить', transcription: '[ˌʌpˈləʊd]' },
      { word: 'password', translation: 'пароль', transcription: '[ˈpɑːswɜːd]' },
      { word: 'username', translation: 'имя пользователя', transcription: '[ˈjuːzəneɪm]' },
      { word: 'database', translation: 'база данных', transcription: '[ˈdeɪtəbeɪs]' },
      { word: 'server', translation: 'сервер', transcription: '[ˈsɜːvə]' },
      { word: 'network', translation: 'сеть', transcription: '[ˈnetwɜːk]' },
      { word: 'security', translation: 'безопасность', transcription: '[sɪˈkjʊərəti]' },
      { word: 'update', translation: 'обновление', transcription: '[ˌʌpˈdeɪt]' },
      { word: 'backup', translation: 'резервная копия', transcription: '[ˈbækʌp]' },
      { word: 'cloud', translation: 'облако', transcription: '[klaʊd]' },
      { word: 'artificial intelligence', translation: 'искусственный интеллект', transcription: '[ˌɑːtɪˈfɪʃl ɪnˈtelɪdʒəns]' },
      { word: 'machine learning', translation: 'машинное обучение', transcription: '[məˈʃiːn ˈlɜːnɪŋ]' },
      { word: 'algorithm', translation: 'алгоритм', transcription: '[ˈælɡərɪðəm]' },
      { word: 'programming', translation: 'программирование', transcription: '[ˈprəʊɡræmɪŋ]' },
      { word: 'developer', translation: 'разработчик', transcription: '[dɪˈveləpə]' }
    ]
  },

  // Наука
  science: {
    en_ru: [
      { word: 'research', translation: 'исследование', transcription: '[rɪˈsɜːtʃ]' },
      { word: 'experiment', translation: 'эксперимент', transcription: '[ɪkˈsperɪmənt]' },
      { word: 'hypothesis', translation: 'гипотеза', transcription: '[haɪˈpɒθəsɪs]' },
      { word: 'theory', translation: 'теория', transcription: '[ˈθɪəri]' },
      { word: 'discovery', translation: 'открытие', transcription: '[dɪˈskʌvəri]' },
      { word: 'invention', translation: 'изобретение', transcription: '[ɪnˈvenʃn]' },
      { word: 'scientist', translation: 'учёный', transcription: '[ˈsaɪəntɪst]' },
      { word: 'laboratory', translation: 'лаборатория', transcription: '[ləˈbɒrətri]' },
      { word: 'analysis', translation: 'анализ', transcription: '[əˈnæləsɪs]' },
      { word: 'data', translation: 'данные', transcription: '[ˈdeɪtə]' },
      { word: 'result', translation: 'результат', transcription: '[rɪˈzʌlt]' },
      { word: 'conclusion', translation: 'вывод', transcription: '[kənˈkluːʒn]' },
      { word: 'evidence', translation: 'доказательство', transcription: '[ˈevɪdəns]' },
      { word: 'method', translation: 'метод', transcription: '[ˈmeθəd]' },
      { word: 'formula', translation: 'формула', transcription: '[ˈfɔːmjələ]' },
      { word: 'equation', translation: 'уравнение', transcription: '[ɪˈkweɪʒn]' },
      { word: 'atom', translation: 'атом', transcription: '[ˈætəm]' },
      { word: 'molecule', translation: 'молекула', transcription: '[ˈmɒlɪkjuːl]' },
      { word: 'cell', translation: 'клетка', transcription: '[sel]' },
      { word: 'energy', translation: 'энергия', transcription: '[ˈenədʒi]' },
      { word: 'gravity', translation: 'гравитация', transcription: '[ˈɡrævəti]' },
      { word: 'physics', translation: 'физика', transcription: '[ˈfɪzɪks]' },
      { word: 'chemistry', translation: 'химия', transcription: '[ˈkemɪstri]' },
      { word: 'biology', translation: 'биология', transcription: '[baɪˈɒlədʒi]' },
      { word: 'mathematics', translation: 'математика', transcription: '[ˌmæθəˈmætɪks]' }
    ]
  },

  // Медицина
  medicine: {
    en_ru: [
      { word: 'doctor', translation: 'врач', transcription: '[ˈdɒktə]' },
      { word: 'nurse', translation: 'медсестра', transcription: '[nɜːs]' },
      { word: 'patient', translation: 'пациент', transcription: '[ˈpeɪʃnt]' },
      { word: 'hospital', translation: 'больница', transcription: '[ˈhɒspɪtl]' },
      { word: 'clinic', translation: 'клиника', transcription: '[ˈklɪnɪk]' },
      { word: 'pharmacy', translation: 'аптека', transcription: '[ˈfɑːməsi]' },
      { word: 'medicine', translation: 'лекарство', transcription: '[ˈmedsn]' },
      { word: 'prescription', translation: 'рецепт', transcription: '[prɪˈskrɪpʃn]' },
      { word: 'symptom', translation: 'симптом', transcription: '[ˈsɪmptəm]' },
      { word: 'diagnosis', translation: 'диагноз', transcription: '[ˌdaɪəɡˈnəʊsɪs]' },
      { word: 'treatment', translation: 'лечение', transcription: '[ˈtriːtmənt]' },
      { word: 'surgery', translation: 'операция', transcription: '[ˈsɜːdʒəri]' },
      { word: 'vaccination', translation: 'вакцинация', transcription: '[ˌvæksɪˈneɪʃn]' },
      { word: 'fever', translation: 'температура/жар', transcription: '[ˈfiːvə]' },
      { word: 'headache', translation: 'головная боль', transcription: '[ˈhedeɪk]' },
      { word: 'pain', translation: 'боль', transcription: '[peɪn]' },
      { word: 'allergy', translation: 'аллергия', transcription: '[ˈælədʒi]' },
      { word: 'infection', translation: 'инфекция', transcription: '[ɪnˈfekʃn]' },
      { word: 'blood pressure', translation: 'кровяное давление', transcription: '[blʌd ˈpreʃə]' },
      { word: 'heart rate', translation: 'пульс', transcription: '[hɑːt reɪt]' },
      { word: 'X-ray', translation: 'рентген', transcription: '[ˈeks reɪ]' },
      { word: 'ambulance', translation: 'скорая помощь', transcription: '[ˈæmbjələns]' },
      { word: 'emergency', translation: 'экстренный случай', transcription: '[ɪˈmɜːdʒənsi]' },
      { word: 'insurance', translation: 'страховка', transcription: '[ɪnˈʃʊərəns]' },
      { word: 'appointment', translation: 'приём (у врача)', transcription: '[əˈpɔɪntmənt]' }
    ]
  },

  // Спорт
  sport: {
    en_ru: [
      { word: 'football', translation: 'футбол', transcription: '[ˈfʊtbɔːl]' },
      { word: 'basketball', translation: 'баскетбол', transcription: '[ˈbɑːskɪtbɔːl]' },
      { word: 'tennis', translation: 'теннис', transcription: '[ˈtenɪs]' },
      { word: 'swimming', translation: 'плавание', transcription: '[ˈswɪmɪŋ]' },
      { word: 'running', translation: 'бег', transcription: '[ˈrʌnɪŋ]' },
      { word: 'gym', translation: 'тренажёрный зал', transcription: '[dʒɪm]' },
      { word: 'training', translation: 'тренировка', transcription: '[ˈtreɪnɪŋ]' },
      { word: 'coach', translation: 'тренер', transcription: '[kəʊtʃ]' },
      { word: 'team', translation: 'команда', transcription: '[tiːm]' },
      { word: 'player', translation: 'игрок', transcription: '[ˈpleɪə]' },
      { word: 'match', translation: 'матч', transcription: '[mætʃ]' },
      { word: 'championship', translation: 'чемпионат', transcription: '[ˈtʃæmpiənʃɪp]' },
      { word: 'winner', translation: 'победитель', transcription: '[ˈwɪnə]' },
      { word: 'score', translation: 'счёт', transcription: '[skɔː]' },
      { word: 'goal', translation: 'гол', transcription: '[ɡəʊl]' },
      { word: 'fitness', translation: 'фитнес', transcription: '[ˈfɪtnəs]' },
      { word: 'exercise', translation: 'упражнение', transcription: '[ˈeksəsaɪz]' },
      { word: 'stadium', translation: 'стадион', transcription: '[ˈsteɪdiəm]' },
      { word: 'medal', translation: 'медаль', transcription: '[ˈmedl]' },
      { word: 'record', translation: 'рекорд', transcription: '[ˈrekɔːd]' },
      { word: 'athlete', translation: 'спортсмен', transcription: '[ˈæθliːt]' },
      { word: 'competition', translation: 'соревнование', transcription: '[ˌkɒmpəˈtɪʃn]' },
      { word: 'referee', translation: 'судья', transcription: '[ˌrefəˈriː]' },
      { word: 'equipment', translation: 'снаряжение', transcription: '[ɪˈkwɪpmənt]' },
      { word: 'warm-up', translation: 'разминка', transcription: '[ˈwɔːm ʌp]' }
    ]
  },

  // Музыка
  music: {
    en_ru: [
      { word: 'song', translation: 'песня', transcription: '[sɒŋ]' },
      { word: 'melody', translation: 'мелодия', transcription: '[ˈmelədi]' },
      { word: 'rhythm', translation: 'ритм', transcription: '[ˈrɪðəm]' },
      { word: 'lyrics', translation: 'текст песни', transcription: '[ˈlɪrɪks]' },
      { word: 'concert', translation: 'концерт', transcription: '[ˈkɒnsət]' },
      { word: 'album', translation: 'альбом', transcription: '[ˈælbəm]' },
      { word: 'singer', translation: 'певец', transcription: '[ˈsɪŋə]' },
      { word: 'musician', translation: 'музыкант', transcription: '[mjuːˈzɪʃn]' },
      { word: 'band', translation: 'группа', transcription: '[bænd]' },
      { word: 'orchestra', translation: 'оркестр', transcription: '[ˈɔːkɪstrə]' },
      { word: 'piano', translation: 'пианино', transcription: '[piˈænəʊ]' },
      { word: 'guitar', translation: 'гитара', transcription: '[ɡɪˈtɑː]' },
      { word: 'drums', translation: 'барабаны', transcription: '[drʌmz]' },
      { word: 'violin', translation: 'скрипка', transcription: '[ˌvaɪəˈlɪn]' },
      { word: 'microphone', translation: 'микрофон', transcription: '[ˈmaɪkrəfəʊn]' },
      { word: 'stage', translation: 'сцена', transcription: '[steɪdʒ]' },
      { word: 'audience', translation: 'аудитория', transcription: '[ˈɔːdiəns]' },
      { word: 'genre', translation: 'жанр', transcription: '[ˈʒɒnrə]' },
      { word: 'classical', translation: 'классический', transcription: '[ˈklæsɪkl]' },
      { word: 'jazz', translation: 'джаз', transcription: '[dʒæz]' },
      { word: 'rock', translation: 'рок', transcription: '[rɒk]' },
      { word: 'pop', translation: 'поп', transcription: '[pɒp]' },
      { word: 'chorus', translation: 'припев', transcription: '[ˈkɔːrəs]' },
      { word: 'verse', translation: 'куплет', transcription: '[vɜːs]' },
      { word: 'playlist', translation: 'плейлист', transcription: '[ˈpleɪlɪst]' }
    ]
  },

  // Искусство
  art: {
    en_ru: [
      { word: 'painting', translation: 'картина', transcription: '[ˈpeɪntɪŋ]' },
      { word: 'sculpture', translation: 'скульптура', transcription: '[ˈskʌlptʃə]' },
      { word: 'artist', translation: 'художник', transcription: '[ˈɑːtɪst]' },
      { word: 'gallery', translation: 'галерея', transcription: '[ˈɡæləri]' },
      { word: 'exhibition', translation: 'выставка', transcription: '[ˌeksɪˈbɪʃn]' },
      { word: 'masterpiece', translation: 'шедевр', transcription: '[ˈmɑːstəpiːs]' },
      { word: 'canvas', translation: 'холст', transcription: '[ˈkænvəs]' },
      { word: 'brush', translation: 'кисть', transcription: '[brʌʃ]' },
      { word: 'palette', translation: 'палитра', transcription: '[ˈpælət]' },
      { word: 'portrait', translation: 'портрет', transcription: '[ˈpɔːtrət]' },
      { word: 'landscape', translation: 'пейзаж', transcription: '[ˈlændskeɪp]' },
      { word: 'abstract', translation: 'абстрактный', transcription: '[ˈæbstrækt]' },
      { word: 'contemporary', translation: 'современный', transcription: '[kənˈtempərəri]' },
      { word: 'frame', translation: 'рама', transcription: '[freɪm]' },
      { word: 'sketch', translation: 'эскиз', transcription: '[sketʃ]' },
      { word: 'drawing', translation: 'рисунок', transcription: '[ˈdrɔːɪŋ]' },
      { word: 'photography', translation: 'фотография', transcription: '[fəˈtɒɡrəfi]' },
      { word: 'design', translation: 'дизайн', transcription: '[dɪˈzaɪn]' },
      { word: 'architecture', translation: 'архитектура', transcription: '[ˈɑːkɪtektʃə]' },
      { word: 'style', translation: 'стиль', transcription: '[staɪl]' },
      { word: 'color', translation: 'цвет', transcription: '[ˈkʌlə]' },
      { word: 'light', translation: 'свет', transcription: '[laɪt]' },
      { word: 'shadow', translation: 'тень', transcription: '[ˈʃædəʊ]' },
      { word: 'texture', translation: 'текстура', transcription: '[ˈtekstʃə]' },
      { word: 'composition', translation: 'композиция', transcription: '[ˌkɒmpəˈzɪʃn]' }
    ]
  },

  // Природа
  nature: {
    en_ru: [
      { word: 'tree', translation: 'дерево', transcription: '[triː]' },
      { word: 'flower', translation: 'цветок', transcription: '[ˈflaʊə]' },
      { word: 'grass', translation: 'трава', transcription: '[ɡrɑːs]' },
      { word: 'forest', translation: 'лес', transcription: '[ˈfɒrɪst]' },
      { word: 'river', translation: 'река', transcription: '[ˈrɪvə]' },
      { word: 'lake', translation: 'озеро', transcription: '[leɪk]' },
      { word: 'ocean', translation: 'океан', transcription: '[ˈəʊʃn]' },
      { word: 'sea', translation: 'море', transcription: '[siː]' },
      { word: 'sky', translation: 'небо', transcription: '[skaɪ]' },
      { word: 'sun', translation: 'солнце', transcription: '[sʌn]' },
      { word: 'moon', translation: 'луна', transcription: '[muːn]' },
      { word: 'star', translation: 'звезда', transcription: '[stɑː]' },
      { word: 'rain', translation: 'дождь', transcription: '[reɪn]' },
      { word: 'snow', translation: 'снег', transcription: '[snəʊ]' },
      { word: 'wind', translation: 'ветер', transcription: '[wɪnd]' },
      { word: 'cloud', translation: 'облако', transcription: '[klaʊd]' },
      { word: 'weather', translation: 'погода', transcription: '[ˈweðə]' },
      { word: 'season', translation: 'сезон', transcription: '[ˈsiːzn]' },
      { word: 'spring', translation: 'весна', transcription: '[sprɪŋ]' },
      { word: 'summer', translation: 'лето', transcription: '[ˈsʌmə]' },
      { word: 'autumn', translation: 'осень', transcription: '[ˈɔːtəm]' },
      { word: 'winter', translation: 'зима', transcription: '[ˈwɪntə]' },
      { word: 'animal', translation: 'животное', transcription: '[ˈænɪml]' },
      { word: 'bird', translation: 'птица', transcription: '[bɜːd]' },
      { word: 'insect', translation: 'насекомое', transcription: '[ˈɪnsekt]' }
    ]
  }
};

// Функция для получения набора слов
const getWordSet = (category, sourceLanguage, targetLanguage) => {
  const langKey = `${sourceLanguage}_${targetLanguage}`;
  const categorySet = wordSets[category];
  
  if (!categorySet) {
    return null;
  }
  
  // Пробуем найти прямое соответствие
  if (categorySet[langKey]) {
    return categorySet[langKey];
  }
  
  // Если нет, возвращаем en_ru как дефолт
  return categorySet['en_ru'] || null;
};

// Список доступных категорий с количеством слов
const getAvailableCategories = () => {
  return Object.keys(wordSets).map(key => ({
    code: key,
    wordsCount: wordSets[key]?.en_ru?.length || 0
  }));
};

module.exports = {
  wordSets,
  getWordSet,
  getAvailableCategories
};
