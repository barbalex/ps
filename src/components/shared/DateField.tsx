import { useMemo } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Field } = fluentUiReactComponents
import { DatePicker } from '@fluentui/react-datepicker-compat'
import type { CalendarStrings } from '@fluentui/react-datepicker-compat'
import { useIntl } from 'react-intl'

import styles from './DateField.module.css'

const toDateOnlyString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Strings containing {0} interpolation (used by Fluent UI's own formatter,
// not react-intl — cannot be passed through the ICU parser).
const calendarFormatStrings: Record<string, Partial<CalendarStrings>> = {
  de: {
    weekNumberFormatString: 'Woche {0}',
    selectedDateFormatString: 'Gewähltes Datum {0}',
    todayDateFormatString: 'Heutiges Datum {0}',
    monthPickerHeaderAriaLabel: '{0}, Jahr wechseln',
    yearPickerHeaderAriaLabel: '{0}, Monat wechseln',
  },
  en: {
    weekNumberFormatString: 'Week number {0}',
    selectedDateFormatString: 'Selected date {0}',
    todayDateFormatString: "Today's date {0}",
    monthPickerHeaderAriaLabel: '{0}, change year',
    yearPickerHeaderAriaLabel: '{0}, change month',
  },
  fr: {
    weekNumberFormatString: 'Semaine {0}',
    selectedDateFormatString: 'Date sélectionnée {0}',
    todayDateFormatString: "Aujourd'hui {0}",
    monthPickerHeaderAriaLabel: "{0}, changer l'année",
    yearPickerHeaderAriaLabel: '{0}, changer le mois',
  },
  it: {
    weekNumberFormatString: 'Settimana {0}',
    selectedDateFormatString: 'Data selezionata {0}',
    todayDateFormatString: 'Data di oggi {0}',
    monthPickerHeaderAriaLabel: '{0}, cambia anno',
    yearPickerHeaderAriaLabel: '{0}, cambia mese',
  },
}

export const DateField = ({
  label,
  value,
  name,
  onChange,
  validationMessage,
  validationState,
  autoFocus,
  ref,
  button,
}) => {
  // console.log('DateField', { value, label, name })
  const { formatMessage, locale } = useIntl()

  const calendarStrings: CalendarStrings = useMemo(
    () => ({
      months: Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { month: 'long' }).format(
          new Date(2000, i, 1),
        ),
      ),
      shortMonths: Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { month: 'short' }).format(
          new Date(2000, i, 1),
        ),
      ),
      // Jan 2 2000 was a Sunday (index 0)
      days: Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
          new Date(2000, 0, 2 + i),
        ),
      ),
      shortDays: Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
          new Date(2000, 0, 2 + i),
        ),
      ),
      goToToday: formatMessage({ id: '2sWIxu', defaultMessage: 'Heute' }),
      prevMonthAriaLabel: formatMessage({
        id: 'PK3h1Q',
        defaultMessage: 'Vorheriger Monat',
      }),
      nextMonthAriaLabel: formatMessage({
        id: 'NpMe6e',
        defaultMessage: 'Nächster Monat',
      }),
      prevYearAriaLabel: formatMessage({
        id: '/WXiU2',
        defaultMessage: 'Vorheriges Jahr',
      }),
      nextYearAriaLabel: formatMessage({
        id: 'Yp0iTR',
        defaultMessage: 'Nächstes Jahr',
      }),
      prevYearRangeAriaLabel: formatMessage({
        id: 'IhOrKh',
        defaultMessage: 'Vorherige Jahresgruppe',
      }),
      nextYearRangeAriaLabel: formatMessage({
        id: 'xGLUF7',
        defaultMessage: 'Nächste Jahresgruppe',
      }),
      closeButtonAriaLabel: formatMessage({
        id: 'ZSShqa',
        defaultMessage: 'Schliessen',
      }),
      dayMarkedAriaLabel: formatMessage({
        id: 'i43yle',
        defaultMessage: 'markiert',
      }),
      ...(calendarFormatStrings[locale] ?? calendarFormatStrings.de),
    }),
    [locale, formatMessage],
  )

  return (
    <Field
      label={label}
      validationMessage={validationMessage}
      validationState={validationState}
    >
      <div className={styles.row}>
        <DatePicker
          strings={calendarStrings}
          placeholder={formatMessage({
            id: 'Hs0f0A',
            defaultMessage: 'Datum wählen oder tippen...',
          })}
          name={name}
          value={value}
          onChange={onChange}
          onSelectDate={(date) =>
            onChange({
              target: {
                name,
                value: date ? toDateOnlyString(date) : null,
                type: 'date',
              },
            })
          }
          firstDayOfWeek={1}
          allowTextInput
          formatDate={(date) =>
            !date ? '' : date?.toLocaleDateString?.('de-CH')
          }
          autoFocus={autoFocus}
          ref={ref}
          appearance="underline"
          className={styles.df}
        />
        {!!button && button}
      </div>
    </Field>
  )
}
