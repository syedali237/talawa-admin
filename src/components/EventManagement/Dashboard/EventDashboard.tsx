/**
 * EventDashboard Component
 *
 * This component is responsible for rendering the event dashboard, which includes
 * event details, statistics, and modals for editing event information. It fetches
 * event data using the `EVENT_DETAILS` GraphQL query and displays it in a structured
 * layout using Bootstrap and custom styles.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.eventId - The unique identifier of the event to be displayed.
 *
 * @returns {JSX.Element} The rendered EventDashboard component.
 *
 * @remarks
 * - The component uses the `useQuery` hook from Apollo Client to fetch event data.
 * - It displays a loader while the event data is being fetched.
 * - The `EventListCardModals` component is used to handle modals for event editing.
 * - The `formatTime` and `formatDate` utility functions are used to format time and date values.
 *
 * @example
 * ```tsx
 * <EventDashboard eventId="12345" />
 * ```
 *
 * @dependencies
 * - `react`, `react-bootstrap`, `@apollo/client`, `@mui/icons-material`
 * - Custom components: `Loader`, `EventListCardModals`
 * - Utility functions: `formatDate`
 *
 * @fileoverview
 * This file defines the EventDashboard component, which is part of the Event Management
 * module in the Talawa Admin application.
 */
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styles from 'style/app-fixed.module.css';
import { useTranslation } from 'react-i18next';
import { EVENT_DETAILS } from 'GraphQl/Queries/Queries';
import { useQuery } from '@apollo/client';
import Loader from 'components/Loader/Loader';
import { Edit } from '@mui/icons-material';
import EventListCardModals from 'components/EventListCard/Modal/EventListCardModals';
import type { InterfaceEvent } from 'types/Event/interface';
import { formatDate } from 'utils/dateFormatter';

const EventDashboard = (props: { eventId: string }): JSX.Element => {
  const { eventId } = props;
  const { t } = useTranslation(['translation', 'common']);
  // const tEventManagement = (key: string): string => t(`eventManagement.${key}`);
  const tEventList = (key: string): string => t(`eventListCard.${key}`);
  const [eventModalIsOpen, setEventModalIsOpen] = useState(false);

  const { data: eventData, loading: eventInfoLoading } = useQuery(
    EVENT_DETAILS,
    { variables: { id: eventId } },
  );

  function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').slice(0, 2);
    return `${hours}:${minutes}`;
  }

  const showViewModal = (): void => {
    setEventModalIsOpen(true);
  };

  const hideViewModal = (): void => {
    setEventModalIsOpen(false);
  };

  if (eventInfoLoading) {
    return <Loader data-testid="loader" />;
  }

  const eventListCardProps: InterfaceEvent = {
    userRole: '',
    key: eventData.event._id,
    _id: eventData.event._id,
    location: eventData.event.location,
    title: eventData.event.title,
    description: eventData.event.description,
    startDate: eventData.event.startDate,
    endDate: eventData.event.endDate,
    startTime: eventData.event.startTime,
    endTime: eventData.event.endTime,
    allDay: eventData.event.allDay,
    recurring: eventData.event.recurring,
    recurrenceRule: eventData.event.recurrenceRule,
    isRecurringEventException: eventData.event.isRecurringEventException,
    isPublic: eventData.event.isPublic,
    isRegisterable: eventData.event.isRegisterable,
    attendees: eventData.event.attendees,
    creator: eventData.event.creator,
  };

  return (
    <div data-testid="event-dashboard">
      <Row className="">
        <EventListCardModals
          eventListCardProps={eventListCardProps}
          eventModalIsOpen={eventModalIsOpen}
          hideViewModal={hideViewModal}
          t={tEventList}
          tCommon={t}
        />
        <div className="d-flex px-6" data-testid="event-stats">
          <div
            className={`${styles.ctacards}`}
            data-testid="registrations-card"
          >
            <img src="/images/svg/attendees.svg" alt="userImage" className="" />
            <div>
              <h1>
                <b data-testid="registrations-count">
                  {eventData.event.attendees.length}
                </b>
              </h1>
              <span>No of Registrations</span>
            </div>
          </div>
          <div className={`${styles.ctacards}`} data-testid="attendees-card">
            <img src="/images/svg/attendees.svg" alt="userImage" className="" />
            <div>
              <h1>
                <b data-testid="attendees-count">
                  {eventData.event.attendees.length}
                </b>
              </h1>
              <span>No of Attendees</span>
            </div>
          </div>
          <div className={`${styles.ctacards}`} data-testid="feedback-card">
            <img src="/images/svg/feedback.svg" alt="userImage" className="" />
            <div>
              <h1>
                <b data-testid="feedback-rating">4/5</b>
              </h1>
              <span>Average Feedback</span>
            </div>
          </div>
        </div>
        <Col>
          <div className={styles.eventContainer} data-testid="event-details">
            <div className={styles.eventDetailsBox}>
              <button
                className="btn btn-light rounded-circle position-absolute end-0 me-3 p-1 mt-2"
                onClick={showViewModal}
                data-testid="edit-event-button"
              >
                <Edit fontSize="medium" />
              </button>
              <h3 className={styles.titlename} data-testid="event-title">
                {eventData.event.title}
              </h3>
              <p className={styles.description} data-testid="event-description">
                {eventData.event.description}
              </p>
              <p className={styles.toporgloc} data-testid="event-location">
                <b>Location:</b> <span>{eventData.event.location}</span>
              </p>
              <p className={styles.toporgloc} data-testid="event-registrants">
                <b>Registrants:</b>{' '}
                <span>{eventData?.event?.attendees?.length}</span>
              </p>
              <div
                className={`${styles.toporgloc} d-flex`}
                data-testid="recurring-status"
              >
                <b>Recurring Event:</b>{' '}
                <span className="text-success ml-2">
                  {eventData.event.recurring ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className={styles.time} data-testid="event-time">
              <p>
                <b className={styles.startTime} data-testid="start-time">
                  {eventData.event.startTime !== null
                    ? `${formatTime(eventData.event.startTime)}`
                    : ``}
                </b>{' '}
                <span className={styles.startDate} data-testid="start-date">
                  {formatDate(eventData.event.startDate)}{' '}
                </span>
              </p>
              <p className={styles.to}>{t('to')}</p>
              <p>
                <b className={styles.endTime} data-testid="end-time">
                  {eventData.event.endTime !== null
                    ? `${formatTime(eventData.event.endTime)}`
                    : ``}
                </b>{' '}
                <span className={styles.endDate} data-testid="end-date">
                  {formatDate(eventData.event.endDate)}{' '}
                </span>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default EventDashboard;
