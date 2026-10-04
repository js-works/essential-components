# XWiki attachment manager

A Lit custom element (`<xwiki-attachment-manager>`) that manages the attachments of an XWiki page, like the Media
Manager of the demo: the data navigator (search, sorting, paging, column filters), an upload drawer with the file
upload, delete with a confirmation, details, toasts. Packaged into a XAR.

It uses the sources of this monorepo's packages, so it builds only inside the monorepo, with the root `node_modules`
installed (`npm install` in the repository root).

- `mvn package`: builds the element with npm (Node must be installed) and packages
  `target/xwiki-attachment-manager-<version>.xar`, with two pages:
  - `AttachmentManager.WebHome`: shows the manager (`?page=Space.Page` in its URL: the attachments of another page).
  - `AttachmentManager.Code` (hidden): the ES module, as its attachment.
- Install: XWiki, Administration > Content > Import, upload the XAR, import both pages.
- `npm run dev`: the dev page at http://localhost:5173, which forwards `/xwiki` to the XWiki at http://localhost:8080
  (real REST API; log in at http://localhost:5173/xwiki/bin/login for pages that need it). The page shown is set in
  `index.html` (`data-xwiki-rest-url`).
- `npm run build`, `npm run typecheck`: the element alone (without Maven).

On any page (with script rights), after the import:

```
{{velocity}}
#set ($codeDoc = $xwiki.getDocument('AttachmentManager.Code'))
{{html clean="false"}}
<xwiki-attachment-manager page="Sandbox.WebHome" heading="Attachments"></xwiki-attachment-manager>
<script type="module" src="$codeDoc.getAttachmentURL('xwiki-attachment-manager.js')"></script>
{{/html}}
{{/velocity}}
```

Attributes (both optional):

- `page`: the page whose attachments are shown (`Space.Page`, `wiki:A.B.Page`). Default: the current page.
- `heading`: the title above the table. Default: none.
