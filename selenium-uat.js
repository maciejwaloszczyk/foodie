const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const APP_URL = 'http://localhost:3000';

(async function runCompleteTest() {
  console.log('--- Test akceptacyjny ---');
  
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // NAWIGACJA 
    
    // 1. Wejście na stronę
    await driver.manage().window().maximize();
    await driver.get(APP_URL);
    console.log('Otwarto strone glowna.');
    
    await driver.sleep(1500); 

    // 2. Szukanie kafelka
    console.log('Szukanie kafelka restauracji');
    let restaurantLink;
    try {
        restaurantLink = await driver.wait(
            until.elementLocated(By.css('a[href^="/restaurant/"]')), 
            5000
        );
        const href = await restaurantLink.getAttribute('href');
        console.log(`Znaleziono link do: ${href}`);
    } catch (e) {
        throw new Error("Nie znaleziono restauracji na liscie");
    }

    // 3. Scroll i Kliknięcie
    await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", restaurantLink);
    await driver.sleep(1000); 
    
    console.log('Klikam w restauracje...');
    await driver.executeScript("arguments[0].click();", restaurantLink);

    // 4. Czekanie na nową stronę
    console.log('Czekam na zaladowanie szczegolow...');
    await driver.wait(until.urlContains('/restaurant/'), 10000);
    console.log(`Jestem na podstronie: ${await driver.getCurrentUrl()}`);



    // WERYFIKACJA DANYCH
    console.log('\n--- Audyt szczegółów ---');

    // Tytuł
    try {
        let h1 = await driver.wait(until.elementLocated(By.css('h1')), 5000);
        let titleText = await h1.getText();
        console.log(`   [OK] Nazwa restauracji: "${titleText}"`);
    } catch (e) {
        console.error('   [BLAD] Nie znaleziono naglowka H1');
    }

    // Opis
    try {
        await driver.findElement(By.xpath("//strong[contains(text(), 'Opis lokalu')]"));
        console.log(`   [OK] Sekcja 'Opis lokalu' jest widoczna.`);
    } catch (e) {
        console.warn('   [INFO] Brak sekcji opisu.');
    }

    // Ocena
    try {
        await driver.findElement(By.xpath("//div[contains(text(), 'Ocena ogólna')]"));
        let rating = await driver.findElement(By.css("div.flex.items-center span.font-semibold")).getText();
        console.log(`   [OK] Wyswietla ocene: ${rating}`);
    } catch (e) {
        console.warn('   [INFO] Brak widocznej oceny.');
    }

    // Adres
    try {
        await driver.findElement(By.xpath("//div[contains(text(), 'Adres')]"));
        console.log(`   [OK] Sekcja adresu jest na miejscu.`);
    } catch (e) {
        console.warn('   [INFO] Brak sekcji adresu.');
    }


    console.log('\n--- Przechodze do widoku mapy ---');
    
    // Scroll na górę
    await driver.executeScript("window.scrollTo(0, 0)");
    await driver.sleep(1000);

    // 1. Szukanie linku "Mapa" w Navbarze
    let mapLink;
    try {
        mapLink = await driver.wait(
            until.elementLocated(By.css('a[href="/map"]')), 
            5000
        );
        console.log('Znaleziono link "Mapa" w nawigacji.');
    } catch (e) {
        throw new Error("Nie znaleziono linku do mapy!");
    }

    // 2. Kliknięcie
    console.log('Klikam w Mape...');
    await driver.executeScript("arguments[0].click();", mapLink);

    // 3. Weryfikacja
    console.log('Czekam na zaladowanie mapy...');
    await driver.wait(until.urlContains('/map'), 5000);
    
    const finalUrl = await driver.getCurrentUrl();
    console.log(`[KROK 3] Jestem na stronie: ${finalUrl}`);

    if (finalUrl.includes('/map')) {
        console.log('\nTEST ZAKONCZONY SUKCESEM. Scenariusz zaliczony.');
    }

  } catch (error) {
    console.error('\nTEST NIE POWIODL SIE:', error.message);
  } 
})();