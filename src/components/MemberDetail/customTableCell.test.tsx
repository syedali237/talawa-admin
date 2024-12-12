import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { CustomTableCell } from './customTableCell';
import { EVENT_DETAILS } from 'GraphQl/Queries/Queries';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mocks = [
  {
    request: {
      query: EVENT_DETAILS,
      variables: { id: 'event123' },
    },
    result: {
      data: {
        event: {
          _id: 'event123',
          title: 'Test Event',
          description: 'This is a test event description',
          startDate: '2023-05-01',
          endDate: '2023-05-02',
          startTime: '09:00:00',
          endTime: '17:00:00',
          allDay: false,
          location: 'Test Location',
          recurring: true,
          baseRecurringEvent: {
            _id: 'recurringEvent123',
          },
          organization: {
            _id: 'org456',
            members: [
              { _id: 'member1', firstName: 'John', lastName: 'Doe' },
              { _id: 'member2', firstName: 'Jane', lastName: 'Smith' },
            ],
          },
          attendees: [{ _id: 'user1' }, { _id: 'user2' }],
        },
      },
    },
  },
];

describe('CustomTableCell', () => {
  it('renders event details correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BrowserRouter>
          <table>
            <tbody>
              <CustomTableCell eventId="event123" />
            </tbody>
          </table>
        </BrowserRouter>
      </MockedProvider>,
    );

    await waitFor(() => screen.getByTestId('custom-row'));

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('1 May 2023')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Test Event' });
    expect(link).toHaveAttribute('href', '/event/org456/event123');
  });

  it('displays loading state', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <table>
          <tbody>
            <CustomTableCell eventId="event123" />
          </tbody>
        </table>
      </MockedProvider>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
