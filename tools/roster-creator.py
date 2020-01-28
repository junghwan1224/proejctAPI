import requests
from datetime import datetime, timedelta

# SERVER_BASE = 'http://localhost:3001'
SERVER_BASE = 'http://13.124.25.4:3001'
ROSTER_CREATE_ROUTE = '/api/roster/create'
DAILY_SCHEDULES = [('10:30', '12:00'), ('12:30', '13:30'),
                   ('14:00', '15:30'), ('16:00', '17:30')]  # must be in 24HR
START_DATE = datetime(2019, 12, 1)
END_DATE = datetime(2020, 3, 31)
EXCEPTIONS = [
    datetime(2020, 1, 1),  # 신정
    datetime(2020, 1, 24),  # 설
    datetime(2020, 1, 25),  # 설
    datetime(2020, 1, 26),  # 설
    datetime(2020, 1, 27),  # 설 대체공휴일
    datetime(2020, 3, 1),  # 3.1절
    datetime(2020, 4, 15),  # 21대 국회의원 선거일,
    datetime(2020, 4, 30),  # 석가탄신일
    datetime(2020, 5, 5),  # 어린이날
    datetime(2020, 6, 6),  # 현충일
    datetime(2020, 7, 15),  # 회사창립일
    datetime(2020, 8, 15),  # 광복절
    datetime(2020, 9, 30),  # 추석
    datetime(2020, 10, 1),  # 추석
    datetime(2020, 10, 2),  # 추석
    datetime(2020, 10, 3),  # 개천절
    datetime(2020, 10, 9),  # 한글날
    datetime(2020, 12, 25)  # 크리스마스
]


def main():
    rosters = create_rosters(DAILY_SCHEDULES, START_DATE, END_DATE, EXCEPTIONS)
    for roster in rosters:
        response = requests.post(url=SERVER_BASE+ROSTER_CREATE_ROUTE, data={
            'departure': roster[0],  # UTC
            'arrival': roster[1]  # UTC
        })
        print(response)


def create_rosters(schedules, start_date, end_date, exceptions):
    """
    <Parameters>
        schedules: list of <str> where each item is in the form of 'HH:MM'
        duration: maximum date.
    <Description>
        This function returns a list of datetime object, where objects consists
        of regular timestamp from Monday to Friday, based on the `schedules`
        and `end_date` parameters.
    """

    timetable = []  # Final returning object

    date_cursor = START_DATE

    while(date_cursor <= end_date):
        if date_cursor.strftime("%a") not in ['Sat', 'Sun'] and \
                date_cursor not in exceptions:
            for time in schedules:
                dhour, dminutes = map(lambda x: int(x), time[0].split(':'))
                ahour, aminutes = map(lambda x: int(x), time[1].split(':'))
                timetable.append(((date_cursor + timedelta(hours=dhour)
                                   + timedelta(minutes=dminutes)),
                                  date_cursor + timedelta(hours=ahour)
                                  + timedelta(minutes=aminutes)))

        date_cursor += timedelta(days=1)
    return timetable


if __name__ == "__main__":
    main()
