import { FormattedMessage, useIntl } from 'react-intl'

import styles from './Index.module.css'

const br = <br />

export const Index = () => {
  const intl = useIntl()

  return (
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
          alt={intl.formatMessage({ defaultMessage: 'Spinnen-Ragwurz' })}
          className={styles.img}
        />
      </picture>
      <div className={styles.scrollContainer}>
        <h6 className={styles.pageTitle}>
          <FormattedMessage defaultMessage="Seltene und bedrohte Arten fördern" />
        </h6>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Orte" />
            </h3>
            <FormattedMessage defaultMessage="Arten in Populationen gliedern." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Zweistufige Orte" />
            </h3>
            <FormattedMessage defaultMessage="Populationen in Teil-Populationen gliedern (fakultativ)." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Ziele" />
            </h3>
            <FormattedMessage defaultMessage="...beschreiben die gewünschte Entwicklung der (Teil-)Populationen." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Art-Verantwortliche Fachpersonen" />
            </h3>
            <FormattedMessage defaultMessage="...beschreiben (Teil-)Populationen, organisieren Kontrollen und Massnahmen, analysieren und berichten." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Massnahmen" />
            </h3>
            <FormattedMessage defaultMessage="...verbessern den Zustand von (Teil-)Populationen." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Kontrollen" />
            </h3>
            <FormattedMessage defaultMessage="...erfassen den Zustand von (Teil-)Populationen und die Wirkung von Massnahmen." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Berichte" />
            </h3>
            <FormattedMessage defaultMessage="...beschreiben und beurteilen die Entwicklung, den Erfolg der Massnahmen und die Erreichung der Ziele." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Beobachtungen Dritter" />
            </h3>
            <FormattedMessage defaultMessage="...importieren, prüfen und (Teil-)Populationen zuordnen." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Mobilfähig" />
            </h3>
            <FormattedMessage defaultMessage="arten-fördern.app passt sich jeder Bildschirmgrösse an. Arbeiten Sie effizient auf Handy, Tablet oder Computer." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Feldtauglich" />
            </h3>
            <FormattedMessage defaultMessage="Sie sind offline? Einfach weiter arbeiten. Wieder online, werden Ihre Daten synchronisiert." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Flexible Konfiguration" />
            </h3>
            <FormattedMessage
              defaultMessage="Sie können arten-fördern.app Ihren eigenen Bedürfnissen anpassen. Vermissen Sie eine Funktion? {link}"
              values={{
                link: (
                  <a
                    href="mailto:alex@gabriel-software.ch?subject=arten-fördern.ch"
                    target="_blank"
                  >
                    <FormattedMessage defaultMessage="Ich bin interessiert!" />
                  </a>
                ),
              }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="wO4TnJ" defaultMessage="Biotope fördern" />
            </h3>
            <FormattedMessage
              id="xP5UoK"
              defaultMessage="arten-fördern.app kann auch Biotope: als Orte anlegen, Ziele definieren, Massnahmen und Kontrollen organisieren, analysieren und berichten."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Professionelle Konfiguration" />
            </h3>
            <FormattedMessage
              defaultMessage="Ich helfe Ihnen gerne bei der Erst-Konfiguration, damit Ihr Team möglichst effizient arbeitet. Profitieren Sie von {link}."
              values={{
                link: (
                  <a
                    href="https://gabriel-software.ch/kontakt/"
                    target="_blank"
                  >
                    <FormattedMessage defaultMessage="meiner Naturschutz- und Software-Erfahrung" />
                  </a>
                ),
              }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Einfaches Onboarding" />
            </h3>
            <FormattedMessage defaultMessage="Erfassen Sie neue Mitarbeitende mit ihrer Email. Ergänzen Sie diese Person bei allen Arten, in denen sie mitarbeiten soll. Fertig!" />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Bring your own device" />
            </h3>
            <FormattedMessage defaultMessage="arten-fördern.app funktioniert auf jedem Betriebssystem: Windows, MacOS, Linux, Android, iOS..." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Teamwork" />
            </h3>
            <FormattedMessage defaultMessage="Daten werden laufend synchronisiert. Mehrere Mitarbeitende können effizient gleichzeitig arbeiten." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Zeitmaschine" />
            </h3>
            <FormattedMessage
              defaultMessage="Haben mehrere Mitarbeitende aus versehen offline die gleichen Daten geändert?{br}{br}Das lässt sich einfach korrigieren. Sie sehen, wer was wann geändert hat."
              values={{ br }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Ihre Daten gehören Ihnen" />
            </h3>
            <FormattedMessage defaultMessage="Alle Ihre Daten werden auf Ihr Gerät synchronisiert. Sie können jederzeit exportiert werden." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Wer zahlt, befiehlt. Wer befiehlt, zahlt..." />
            </h3>
            <FormattedMessage
              defaultMessage="Es zahlt, wer Projekte konfiguriert.{br}Testen und mitarbeiten ist gratis."
              values={{ br }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Open Source" />
            </h3>
            <FormattedMessage defaultMessage="Der Code ist offen. Sie können das Projekt jederzeit einsehen, mitgestalten, kopieren und selber weiter entwickeln (lassen)." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Hier wird gebaut" />
            </h3>
            <FormattedMessage defaultMessage="Diese App ist in Entwicklung. Noch steckt sie voller Fehler. Funktionen werden laufend ergänzt. Daten werden sporadisch gelöscht und neu erstellt." />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage defaultMessage="Rückmeldungen erwünscht" />
            </h3>
            <FormattedMessage
              defaultMessage="Sie dürfen gerne reinschauen, testen und mir Ihre Eindrücke und Wünsche {link}."
              values={{
                link: (
                  <a
                    href="mailto:alex@gabriel-software.ch?subject=arten-fördern.ch"
                    target="_blank"
                  >
                    <FormattedMessage defaultMessage="mitteilen" />
                  </a>
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
