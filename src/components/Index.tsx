

import styles from './Index.module.css'

export const Index = () => (
  <div className={styles.container}>
    <picture>
      <source
        srcSet="home_700.avif 700w, home_1000.avif 1000w, home_1400.avif 1400w, home_2000.avif 2000w, home_2500.avif 2500w"
        type="image/avif"
      />
      <img
        src="home_700.webp"
        srcSet="home_700.webp 700w, home_1000.webp 1000w, home_1400.webp 1400w, home_2000.webp 2000w, home_2500.webp 2500w"
        sizes="100vw"
        alt="Spinnen-Ragwurz"
        className={styles.img}
      />
    </picture>
    <div className={styles.scrollContainer}>
      <h6 className={styles.pageTitle}>Bedrohte Arten und Biotope fördern</h6>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Arten und Biotope</h3>
          Seltene und bedrohte Arten und Biotope überwachen und fördern.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ziele</h3>
          ...beschreiben die gewünschte Entwicklung.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Räume</h3>
          Arten in Populationen gliedern, Biotope in Flächen.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Zweistufige Räume</h3>
          Populationen und Biotopflächen weiter unterteilen.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Verantwortliche</h3>
          ...beschreiben Räume, organisieren Kontrollen und Massnahmen,
          analysieren und berichten.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Massnahmen</h3>
          ...verbessern den Zustand einer Art oder eines Biotops.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Kontrollen</h3>
          ...erfassen den Zustand von Räumen und die Wirkung von Massnahmen.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Berichte</h3>
          ...beschreiben die Entwick&shy;lung von Populationen, beurteilen den
          Erfolg der Massnahmen und die Errei&shy;chung der Ziele.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Beobachtungen Dritter</h3>
          ...prüfen und den Popula&shy;tionen und Biotopen zuordnen.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Mobilfähig</h3>
          Promoting Species passt sich jeder Bildschirmgrösse an. Arbeiten Sie
          effizient auf Handy, Tablet oder Computer.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Bring your own device</h3>
          Promoting Species funktioniert auf jedem Betriebssystem: Windows,
          MacOS, Linux, Android, iOS...
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Kein Internet? Egal!</h3>
          Sie sind offline? Einfach weiter arbeiten. Sobald Sie wieder online
          sind, werden Ihre Daten synchronisiert.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Flexible Konfiguration</h3>
          Sie können Promoting Species Ihren eigenen Bedürfnissen anpassen.
          Vermissen Sie eine Funktion? Ich bin interessiert!
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Professionelle Konfiguration</h3>
          Ich helfe Ihnen gerne bei der Erst-Konfiguration, damit Ihr Team
          möglichst effizient arbeitet.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Einfaches Onboarding</h3>
          Erfassen Sie neue Mitarbeitende mit ihrer Email. Ergänzen Sie diese
          Person bei allen Arten und Biotopen, in denen sie mitarbeiten soll.
          Fertig!
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Teamwork</h3>
          Daten werden laufend synchronisiert. Mehrere Mitarbeitende können
          effizient gleichzeitig arbeiten.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Zeitmaschine</h3>
          Mehrere Mitarbeitende haben aus versehen offline die gleichen Daten
          geändert?
          <br />
          <br />
          Das lässt sich einfach korrigieren. Sie sehen, wer was wann geändert
          hat.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ihre Daten gehören Ihnen</h3>
          100% Ihrer Daten werden auf Ihr Gerät synchronisiert. Sie können
          jederzeit exportiert werden.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            Wer zahlt, befiehlt. Wer befiehlt, zahlt...
          </h3>
          Es zahlt, wer Projekte konfiguriert.
          <br />
          Testen ist gratis.
          <br />
          Mitarbeitende zahlen nicht.
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Open Source</h3>
          Der Code ist offen. Sie können das Projekt jederzeit einsehen,
          mitgestalten, kopieren und selber weiter entwickeln (lassen).
        </div>
      </div>
    </div>
  </div>
)