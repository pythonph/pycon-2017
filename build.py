import os
from collections import OrderedDict
from datetime import datetime

import arrow
import frontmatter
import requests
from jinja2 import Environment, FileSystemLoader

AIRTABLE_API_KEY = os.environ['AIRTABLE_API_KEY']
AIRTABLE_ENDPOINT = os.environ['AIRTABLE_ENDPOINT']
PAGES = ('index',)


def render(context):
    env = Environment(loader=FileSystemLoader('./templates'))
    for name in PAGES:
        basename = name + '.html'
        page = frontmatter.load(os.path.join('templates', basename))
        template = env.from_string(page.content)
        with open(basename, 'wb') as f:
            page_context = {}
            page_context.update(**context)
            page_context.update(**page.metadata)
            f.write(template.render(**page_context).encode('utf-8'))
        print 'Wrote {}'.format(basename)


def get_speakers():
    resp = requests.get(
        AIRTABLE_ENDPOINT + '/Speakers',
        params={'maxRecords': 100,
                'view': 'Main View'},
        headers={'Authorization': 'Bearer ' + AIRTABLE_API_KEY})
    for speaker in resp.json()['records']:
        yield speaker['fields']


def get_time_range(day):
    start = arrow.get(datetime(2017, 2, day, 8), 'Asia/Manila')
    end = arrow.get(datetime(2017, 2, day, 19), 'Asia/Manila')
    for r in arrow.Arrow.span_range('hour', start, end, tz='Asia/Manila'):
        yield r[0].isoformat()
        if r[0] < end:
            yield r[0].replace(minutes=+30).isoformat()


def get_schedule(view):
    resp = requests.get(
        AIRTABLE_ENDPOINT + '/Schedule',
        params={'maxRecords': 100,
                'view': view},
        headers={'Authorization': 'Bearer ' + AIRTABLE_API_KEY})
    activities = OrderedDict()
    for record in resp.json()['records']:
        fields = record['fields']
        activity = activities.setdefault(fields['Activity'], [])
        start = arrow.get(fields['Start']).to('Asia/Manila')
        end = arrow.get(fields['End']).to('Asia/Manila')
        activity.append({
            'start': start.isoformat(),
            'end': end.isoformat(),
            'topic': fields['Topic'],
            'description': fields.get('Description'),
        })
    return activities


if __name__ == '__main__':
    context = {
        'speakers': get_speakers(),
        'time_range_day_1': list(get_time_range(25)),
        'time_range_day_2': list(get_time_range(26)),
        'schedule_day_1': get_schedule('Day 1'),
        'schedule_day_2': get_schedule('Day 2'),
    }
    render(context)
