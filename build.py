import os

from jinja2 import Environment, FileSystemLoader
import frontmatter
import requests

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


if __name__ == '__main__':
    context = {'speakers': get_speakers()}
    render(context)
