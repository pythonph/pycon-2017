# PyCon PH 2017

## Setup

```sh
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
yarn
```

## Config

Config is retrieved from environment variables:

- `AIRTABLE_API_KEY` - Airtable API key
- `AIRTABLE_ENDPOINT` - Airtable API endpoint

## Build

```
source venv/bin/activate
export $(cat .env | xargs) && python build.py && yarn build
```
