<h1 align="center">
  gatsby-plugin-drupal-preview
</h1>

Contains helper function to convert Drupal Json data into Gatsby Node object.

## Quick start

To get started creating a new plugin, you can follow these steps:

1. Install and configure the <a href="https://www.drupal.org/project/simple_decoupled_preview" target="_blank">Simple Decoupled Preview</a> module on your Drupal site.


If you already have a Gatsby site, you can use it. Otherwise, you can [create a new Gatsby site](https://www.gatsbyjs.com/tutorial/part-0/#create-a-gatsby-site) to test your plugin.

2. Install this plugin in your Gatsby site.

`npm install gatsby-plugin-drupal-preview`

3. In your pages directory of your Gatsby site, create a new page using the file system route api pattern to accept parameters.

Your new page will look similar to this:

```text
/my-gatsby-site
├── gatsby-config.js
└── /src
    └── /pages
        └── /preview
            └──[...].jsx
```

4. This page url is what the Drupal iframe is going to link to including parameters to assist you with serving the proper Page template and making api request to your Drupal site to fetch the Json.

An example iframe url will be composed as in this example:

```text
https://www.mygatsbysite.com/preview/{bundle}/{uuid}/{langcode}/{uid}
```
How to use the parameters:

* {bundle} - This is the node type of the preview node. Use this to determine which template on your Gatsby site to pass the data to.
* {uuid} - This is the UUID property of the preview node.
* {langcode} - This is the language code of the preview node.
* {uid} - This is the ID of the user that triggered the preview in Drupal.

An actual iframe url example that depicts these parameters:
```text
http://localhost:8000/preview/page/ed8145e8-33c4-4497-b4e0-c441f1ad3079/en/1
```


## How to use the plugin

In your Preview page template, import the helper function from this plugin.
```javascript
import {createNodeFromPreview} from "gatsby-plugin-preview"
```
Import your page templates. Example:
```javascript
import ArticleTemplate from "../../templates/article"
import PageTemplate from "../../templates/page"
```
Alternatively, you can lazyload the templates and create a helper function to return the desired template.
```javascript
const pageTemplates = {
  page: React.lazy(() => import("../../templates/page")),
  article: React.lazy(() => import("../../templates/article"))
}

// Helper function.
const getTemplate = (bundle, data) => {
  if (pageTemplates.hasOwnProperty(bundle)) {
    const PreviewTemplate = pageTemplates[bundle]
    return (
      <React.Suspense fallback={<>Loading ${bundle} template...</>}>
        <PreviewTemplate data={data}/>
      </React.Suspense>
    )
  }
  return null;
}
```
## Example Fetching the data with Axios from Drupal
This is only an example to get you started. Your exact implementation could be entirely different.
```javascript
const PreviewPage = ({...props}) => {
  const [state, setState] = React.useState({
    data: undefined,
    error: null,
    loaded: false,
  });

  const { data, error, loaded } = state;

  const splat = props.params[`*`]
  const [bundle, uuid, langcode, uid] = splat.split('/')
  // We need to define the baseUrl for images.
  const baseUrl = process.env.GATSBY_BASE_URL || ''

  React.useEffect(() => {
    async function fetchData() {
      try {
        const endpoint = `${process.env.GATSBY_BASE_URL}/api/preview/${uuid}`;
        const response = await axios.get(endpoint, {
          headers: {
            "api-key": process.env.GATSBY_API_KEY || "",
          },
          params: {
            langcode,
            uid,
          },
        });
        setState({ data: createNodeFromPreview(response.data, baseUrl, 'node'), error: null, loaded: true });
      } catch (e) {
        setState({ data: undefined, error: e.message, loaded: true });
      }
    }
    fetchData();
  }, [uuid, langcode]);

  if (error || !loaded) {
    // Return something else in case of error and while data is fetching.
  }
  if (data) {
    return getTemplate(bundle, data)
  }
  return null
}

export default PreviewPage
```

