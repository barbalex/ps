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
          alt={intl.formatMessage({
            id: 'rxRJ6H',
            defaultMessage: 'Spinnen-Ragwurz',
          })}
          className={styles.img}
        />
      </picture>
      <div className={styles.scrollContainer}>
        <h6 className={styles.pageTitle}>
          <FormattedMessage
            id="KFwvHV"
            defaultMessage="Seltene und bedrohte Arten fördern"
          />
        </h6>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="h5g7Kk" defaultMessage="Orte" />
            </h3>
            <FormattedMessage
              id="lOK5dy"
              defaultMessage="Arten in Populationen gliedern."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="2iLc/W" defaultMessage="Zweistufige Orte" />
            </h3>
            <FormattedMessage
              id="74x/v0"
              defaultMessage="Populationen in Teil-Populationen gliedern (fakultativ)."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="3srcwg" defaultMessage="Ziele" />
            </h3>
            <FormattedMessage
              id="1yf63B"
              defaultMessage="...beschreiben die gewünschte Entwicklung der (Teil-)Populationen."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="sY7iHm"
                defaultMessage="Art-Verantwortliche Fachpersonen"
              />
            </h3>
            <FormattedMessage
              id="BNlEeN"
              defaultMessage="...beschreiben (Teil-)Populationen, organisieren Kontrollen und Massnahmen, analysieren und berichten."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="eJfllL" defaultMessage="Massnahmen" />
            </h3>
            <FormattedMessage
              id="HjZkRK"
              defaultMessage="...verbessern den Zustand von (Teil-)Populationen."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="oPMDm+" defaultMessage="Kontrollen" />
            </h3>
            <FormattedMessage
              id="VncgQ7"
              defaultMessage="...erfassen den Zustand von (Teil-)Populationen und die Wirkung von Massnahmen."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="CiJ0SG" defaultMessage="Berichte" />
            </h3>
            <FormattedMessage
              id="pPWZGx"
              defaultMessage="...beschreiben und beurteilen die Entwicklung, den Erfolg der Massnahmen und die Erreichung der Ziele."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="L7Xr8Z"
                defaultMessage="Beobachtungen Dritter"
              />
            </h3>
            <FormattedMessage
              id="sST5WH"
              defaultMessage="...importieren, prüfen und (Teil-)Populationen zuordnen."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="bC0sCs" defaultMessage="Mobilfähig" />
            </h3>
            <FormattedMessage
              id="CHlBuE"
              defaultMessage="arten-fördern.app passt sich jeder Bildschirmgrösse an. Arbeiten Sie effizient auf Handy, Tablet oder Computer."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="pfBGqS" defaultMessage="Feldtauglich" />
            </h3>
            <FormattedMessage
              id="OW3d3V"
              defaultMessage="Sie sind offline? Einfach weiter arbeiten. Wieder online, werden Ihre Daten synchronisiert."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="H5/rUM"
                defaultMessage="Flexible Konfiguration"
              />
            </h3>
            <FormattedMessage
              id="2hj7nH"
              defaultMessage="Sie können arten-fördern.app Ihren eigenen Bedürfnissen anpassen. Vermissen Sie eine Funktion? {link}"
              values={{
                link: (
                  <a
                    href="mailto:alex@gabriel-software.ch?subject=arten-fördern.ch"
                    target="_blank"
                  >
                    <FormattedMessage
                      id="OogWmh"
                      defaultMessage="Ich bin interessiert!"
                    />
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
              defaultMessage="arten-fördern.app kann auch Biotope: beschreiben, Ziele definieren, Massnahmen und Kontrollen organisieren, Entwicklung analysieren und berichten."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="VXoP2c"
                defaultMessage="Professionelle Konfiguration"
              />
            </h3>
            <FormattedMessage
              id="HsHmZy"
              defaultMessage="Ich helfe Ihnen gerne bei der Erst-Konfiguration, damit Ihr Team möglichst effizient arbeitet. Profitieren Sie von {link}."
              values={{
                link: (
                  <a
                    href="https://gabriel-software.ch/kontakt/"
                    target="_blank"
                  >
                    <FormattedMessage
                      id="YCQ66b"
                      defaultMessage="meiner Naturschutz- und Software-Erfahrung"
                    />
                  </a>
                ),
              }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="VP9dXS"
                defaultMessage="Einfaches Onboarding"
              />
            </h3>
            <FormattedMessage
              id="pTRYGx"
              defaultMessage="Erfassen Sie neue Mitarbeitende mit ihrer Email. Ergänzen Sie diese Person bei allen Arten, in denen sie mitarbeiten soll. Fertig!"
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="Oy8x+u"
                defaultMessage="Bring your own device"
              />
            </h3>
            <FormattedMessage
              id="gjvJCk"
              defaultMessage="arten-fördern.app funktioniert auf jedem Betriebs&shy;system: Windows, Mac­OS, Linux, Android, iOS..."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="iaro8o" defaultMessage="Teamwork" />
            </h3>
            <FormattedMessage
              id="04Jmk6"
              defaultMessage="Daten werden laufend synchronisiert. Mehrere Mitarbeitende können effizient gleichzeitig arbeiten."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="SLjrHl" defaultMessage="Zeitmaschine" />
            </h3>
            <FormattedMessage
              id="rEN8QI"
              defaultMessage="Haben mehrere Mitarbeitende aus versehen offline die gleichen Daten geändert? Das lässt sich einfach korrigieren. Sie sehen, wer was wann geändert hat."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="6ddsDI"
                defaultMessage="Ihre Daten gehören Ihnen"
              />
            </h3>
            <FormattedMessage
              id="9LbkBJ"
              defaultMessage="Alle Ihre Daten werden auf Ihr Gerät synchronisiert. Sie können jederzeit exportiert werden."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="yubcwe"
                defaultMessage="Wer zahlt, befiehlt. Wer befiehlt, zahlt..."
              />
            </h3>
            <FormattedMessage
              id="9ZCq87"
              defaultMessage="Es zahlt, wer Projekte konfiguriert.{br}Testen und mitarbeiten ist gratis."
              values={{ br }}
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="Xd0J7Y" defaultMessage="Open Source" />
            </h3>
            <FormattedMessage
              id="yoo7JY"
              defaultMessage="Der Code ist offen. Sie können das Projekt jederzeit einsehen, mitgestalten, kopieren und selber weiter entwickeln (lassen)."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage id="ZiBLs/" defaultMessage="Hier wird gebaut" />
            </h3>
            <FormattedMessage
              id="zq+cvN"
              defaultMessage="Diese App ist in Entwicklung. Noch steckt sie voller Fehler. Funktionen werden laufend ergänzt. Daten werden sporadisch gelöscht und neu erstellt."
            />
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FormattedMessage
                id="9WEWTz"
                defaultMessage="Rückmeldungen erwünscht"
              />
            </h3>
            <FormattedMessage
              id="WrtHNX"
              defaultMessage="Sie dürfen gerne reinschauen, testen und mir Ihre Eindrücke und Wünsche {link}."
              values={{
                link: (
                  <a
                    href="mailto:alex@gabriel-software.ch?subject=arten-fördern.ch"
                    target="_blank"
                  >
                    <FormattedMessage id="9KB+sP" defaultMessage="mitteilen" />
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
