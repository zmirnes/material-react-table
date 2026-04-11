# Copilot Custom Instructions

Prilikom generisanja koda, obavezno se pridržavaj sljedećih pravila:

- **Komentarisanje:** Koristi single-line komentare za svaku liniju koda koja može biti zbunjujuća prilikom PR review-a.
- **Imenovanje:** Varijable moraju imati opisna imena koja tačno objašnjavaju namjeru. Bolje je dugo i jasno ime nego kratko i nejasno.
- **Arhitektura:** Strogo primjenjuj SOLID principe. Komponente moraju biti jednostavne, a fajlovi što kraći.
- **Design Patterns:** Koristi GoF patterne prilagođene funkcionalnom programiranju u React/JavaScript okruženju. Fokus je na principu rješavanja problema.
- **TypeScript:** Zabranjeno korištenje `any` tipa. Type casting (`as`) svesti na apsolutni minimum ili potpuno izbaciti.
- **Responsiveness:** Sav generisani kod (UI) mora biti responzivan i prilagođen svim uređajima.
- **Modularnost:** Razbijaj kod na što manje funkcionalne cjeline sa jasnim nazivima. 
    - Izbacuj mapiranja u zasebne konstante ili funkcije.
    - Render logiku unutar `.map()` funkcija izdvoj u zasebne komponente ili helper funkcije.