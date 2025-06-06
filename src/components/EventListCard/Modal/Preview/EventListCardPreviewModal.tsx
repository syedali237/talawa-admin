/**
 * PreviewModal Component
 *
 * This component renders a modal for previewing and editing event details.
 * It provides functionality to view, update, and manage event properties such as
 * title, description, location, date, time, recurrence, and visibility settings.
 *
 * @component
 * @param {InterfacePreviewEventModalProps} props - The props for the PreviewModal component.
 * @param {boolean} props.eventModalIsOpen - Determines if the modal is open.
 * @param {Function} props.hideViewModal - Function to close the modal.
 * @param {Function} props.toggleDeleteModal - Function to toggle the delete confirmation modal.
 * @param {Function} props.t - Translation function for event-specific strings.
 * @param {Function} props.tCommon - Translation function for common strings.
 * @param {boolean} props.isRegistered - Indicates if the user is registered for the event.
 * @param {string} props.userId - The ID of the current user.
 * @param {Date} props.eventStartDate - The start date of the event.
 * @param {Date} props.eventEndDate - The end date of the event.
 * @param {Function} props.setEventStartDate - Function to update the event start date.
 * @param {Function} props.setEventEndDate - Function to update the event end date.
 * @param {boolean} props.alldaychecked - Indicates if the event is an all-day event.
 * @param {Function} props.setAllDayChecked - Function to toggle the all-day event setting.
 * @param {boolean} props.recurringchecked - Indicates if the event is recurring.
 * @param {Function} props.setRecurringChecked - Function to toggle the recurring event setting.
 * @param {boolean} props.publicchecked - Indicates if the event is public.
 * @param {Function} props.setPublicChecked - Function to toggle the public event setting.
 * @param {boolean} props.registrablechecked - Indicates if the event is registrable.
 * @param {Function} props.setRegistrableChecked - Function to toggle the registrable event setting.
 * @param {Object} props.recurrenceRuleState - The state of the recurrence rule.
 * @param {Function} props.setRecurrenceRuleState - Function to update the recurrence rule state.
 * @param {string} props.recurrenceRuleText - Text representation of the recurrence rule.
 * @param {Object} props.formState - The state of the form fields.
 * @param {Function} props.setFormState - Function to update the form state.
 * @param {Function} props.registerEventHandler - Function to handle event registration.
 * @param {Function} props.handleEventUpdate - Function to handle event updates.
 * @param {Function} props.openEventDashboard - Function to navigate to the event dashboard.
 *
 * @returns {JSX.Element} A modal for previewing and managing event details.
 */
import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import styles from 'style/app-fixed.module.css';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import type { InterfacePreviewEventModalProps } from 'types/Event/interface';
import { Role } from 'types/Event/interface';
import { Days, getWeekDayOccurenceInMonth } from 'utils/recurrenceUtils';

import RecurrenceOptions from 'components/RecurrenceOptions/RecurrenceOptions';

const PreviewModal: React.FC<InterfacePreviewEventModalProps> = ({
  eventListCardProps,
  eventModalIsOpen,
  hideViewModal,
  toggleDeleteModal,
  t,
  tCommon,
  popover,
  weekDayOccurenceInMonth,
  isRegistered,
  userId,
  eventStartDate,
  eventEndDate,
  setEventStartDate,
  setEventEndDate,
  alldaychecked,
  setAllDayChecked,
  recurringchecked,
  setRecurringChecked,
  publicchecked,
  setPublicChecked,
  registrablechecked,
  setRegistrableChecked,
  recurrenceRuleState,
  setRecurrenceRuleState,
  recurrenceRuleText,
  formState,
  setFormState,
  registerEventHandler,
  handleEventUpdate,
  openEventDashboard,
}) => {
  const timeToDayJs = (time: string): Dayjs => {
    const dateTimeString = dayjs().format('YYYY-MM-DD') + ' ' + time;
    return dayjs(dateTimeString, { format: 'YYYY-MM-DD HH:mm:ss' });
  };

  return (
    <Modal show={eventModalIsOpen} centered dialogClassName="" scrollable>
      <Modal.Header>
        <p className={styles.titlemodal}>{t('eventDetails')}</p>
        <Button
          variant="danger"
          onClick={hideViewModal}
          data-testid="eventModalCloseBtn"
        >
          <i className="fa fa-times"></i>
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <p className={styles.previewEventListCardModals}>{t('eventTitle')}</p>
          <Form.Control
            type="title"
            id="eventitle"
            className={`mb-3 ${styles.inputField}`}
            autoComplete="off"
            data-testid="updateTitle"
            required
            value={
              formState.title.length > 100
                ? formState.title.substring(0, 100) + '...'
                : formState.title
            }
            onChange={(e): void => {
              setFormState({ ...formState, title: e.target.value });
            }}
            disabled={
              !(eventListCardProps.creator?._id === userId) &&
              eventListCardProps.userRole === Role.USER
            }
          />
          <p className={styles.previewEventListCardModals}>
            {tCommon('description')}
          </p>
          <Form.Control
            type="eventdescrip"
            id="eventdescrip"
            className={`mb-3 ${styles.inputField}`}
            autoComplete="off"
            data-testid="updateDescription"
            required
            value={
              formState.eventdescrip.length > 256
                ? formState.eventdescrip.substring(0, 256) + '...'
                : formState.eventdescrip
            }
            onChange={(e): void => {
              setFormState({ ...formState, eventdescrip: e.target.value });
            }}
            disabled={
              !(eventListCardProps.creator?._id === userId) &&
              eventListCardProps.userRole === Role.USER
            }
          />
          <p className={styles.previewEventListCardModals}>
            {tCommon('location')}
          </p>
          <Form.Control
            type="text"
            id="location"
            className={`mb-3 ${styles.inputField}`}
            autoComplete="off"
            data-testid="updateLocation"
            required
            value={formState.location}
            onChange={(e): void => {
              setFormState({ ...formState, location: e.target.value });
            }}
            disabled={
              !(eventListCardProps.creator?._id === userId) &&
              eventListCardProps.userRole === Role.USER
            }
          />
          <div className={styles.datediv}>
            <div>
              <DatePicker
                label={tCommon('startDate')}
                className={styles.datebox}
                value={dayjs(eventStartDate)}
                onChange={(date: Dayjs | null): void => {
                  if (date) {
                    setEventStartDate(date?.toDate());
                    setEventEndDate(
                      eventEndDate < date?.toDate()
                        ? date?.toDate()
                        : eventEndDate,
                    );
                    if (!eventListCardProps.recurring) {
                      setRecurrenceRuleState({
                        ...recurrenceRuleState,
                        recurrenceStartDate: date?.toDate(),
                        weekDays: [Days[date?.toDate().getDay()]],
                        weekDayOccurenceInMonth: weekDayOccurenceInMonth
                          ? getWeekDayOccurenceInMonth(date?.toDate())
                          : undefined,
                      });
                    }
                  }
                }}
              />
            </div>
            <div>
              <DatePicker
                label={tCommon('endDate')}
                className={styles.datebox}
                value={dayjs(eventEndDate)}
                onChange={(date: Dayjs | null): void => {
                  if (date) {
                    setEventEndDate(date?.toDate());
                  }
                }}
                minDate={dayjs(eventStartDate)}
              />
            </div>
          </div>
          {!alldaychecked && (
            <div className={styles.datediv}>
              <div>
                <TimePicker
                  label={tCommon('startTime')}
                  className={styles.datebox}
                  timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                  value={timeToDayJs(formState.startTime)}
                  onChange={(time): void => {
                    if (time) {
                      setFormState({
                        ...formState,
                        startTime: time?.format('HH:mm:ss'),
                        endTime:
                          timeToDayJs(formState.endTime) < time
                            ? time?.format('HH:mm:ss')
                            : formState.endTime,
                      });
                    }
                  }}
                  disabled={alldaychecked}
                />
              </div>
              <div>
                <TimePicker
                  label={tCommon('endTime')}
                  className={styles.datebox}
                  timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                  value={timeToDayJs(formState.endTime)}
                  onChange={(time): void => {
                    if (time) {
                      setFormState({
                        ...formState,
                        endTime: time?.format('HH:mm:ss'),
                      });
                    }
                  }}
                  minTime={timeToDayJs(formState.startTime)}
                  disabled={alldaychecked}
                />
              </div>
            </div>
          )}
          <div className={styles.checkboxContainer}>
            <div className={styles.checkboxdivEventListCardModals}>
              <div className={styles.dispflexEventListCardModals}>
                <label htmlFor="allday">{t('allDay')}?</label>
                <Form.Switch
                  id="allday"
                  type="checkbox"
                  data-testid="updateAllDay"
                  className={styles.switch}
                  checked={alldaychecked}
                  onChange={(): void => {
                    setAllDayChecked(!alldaychecked);
                  }}
                  disabled={
                    !(eventListCardProps.creator?._id === userId) &&
                    eventListCardProps.userRole === Role.USER
                  }
                />
              </div>
              <div className={styles.dispflexEventListCardModals}>
                <label htmlFor="recurring">{t('recurringEvent')}:</label>
                <Form.Switch
                  id="recurring"
                  type="checkbox"
                  data-testid="updateRecurring"
                  className={styles.switch}
                  checked={recurringchecked}
                  onChange={(): void => {
                    setRecurringChecked(!recurringchecked);
                  }}
                  disabled={
                    !(eventListCardProps.creator?._id === userId) &&
                    eventListCardProps.userRole === Role.USER
                  }
                />
              </div>
            </div>
            <div className={styles.checkboxdivEventListCardModals}>
              <div className={styles.dispflexEventListCardModals}>
                <label htmlFor="ispublic">{t('isPublic')}?</label>
                <Form.Switch
                  id="ispublic"
                  type="checkbox"
                  data-testid="updateIsPublic"
                  className={styles.switch}
                  checked={publicchecked}
                  onChange={(): void => {
                    setPublicChecked(!publicchecked);
                  }}
                  disabled={
                    !(eventListCardProps.creator?._id === userId) &&
                    eventListCardProps.userRole === Role.USER
                  }
                />
              </div>
              <div className={styles.dispflexEventListCardModals}>
                <label htmlFor="registrable">{t('isRegistrable')}?</label>
                <Form.Switch
                  id="registrable"
                  type="checkbox"
                  data-testid="updateRegistrable"
                  className={styles.switch}
                  checked={registrablechecked}
                  onChange={(): void => {
                    setRegistrableChecked(!registrablechecked);
                  }}
                  disabled={
                    !(eventListCardProps.creator?._id === userId) &&
                    eventListCardProps.userRole === Role.USER
                  }
                />
              </div>
            </div>
          </div>

          {/* Recurrence Options */}
          {recurringchecked && (
            <RecurrenceOptions
              recurrenceRuleState={recurrenceRuleState}
              recurrenceRuleText={recurrenceRuleText}
              setRecurrenceRuleState={setRecurrenceRuleState}
              popover={popover}
              t={t}
              tCommon={tCommon}
            />
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {(eventListCardProps.userRole !== Role.USER ||
          eventListCardProps.creator?._id === userId) && (
          <Button
            variant="success"
            onClick={openEventDashboard}
            data-testid="showEventDashboardBtn"
            className={styles.addButton}
          >
            {' '}
            Show Event Dashboard{' '}
          </Button>
        )}
        {(eventListCardProps.userRole !== Role.USER ||
          eventListCardProps.creator?._id === userId) && (
          <Button
            variant="success"
            className={styles.addButton}
            data-testid="updateEventBtn"
            onClick={handleEventUpdate}
          >
            {t('editEvent')}
          </Button>
        )}
        {(eventListCardProps.userRole !== Role.USER ||
          eventListCardProps.creator?._id === userId) && (
          <Button
            variant="danger"
            data-testid="deleteEventModalBtn"
            className={styles.removeButton}
            onClick={toggleDeleteModal}
          >
            {t('deleteEvent')}
          </Button>
        )}
        {eventListCardProps.userRole === Role.USER &&
          !(eventListCardProps.creator?._id === userId) &&
          (isRegistered ? (
            <Button className={styles.addButton} variant="success" disabled>
              {t('alreadyRegistered')}
            </Button>
          ) : (
            <Button
              className={styles.addButton}
              variant="success"
              onClick={registerEventHandler}
              data-testid="registerEventBtn"
            >
              {tCommon('register')}
            </Button>
          ))}
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
