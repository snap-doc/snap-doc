exports['Markdown utils tests createTagsTable - no rows 1'] = {
  "type": "paragraph",
  "children": [{
    "type": "table",
    "children": [
      {
        "type": "tableRow",
        "children": [
          {
            "type": "tableCell",
            "children": [
              {
                "type": "text",
                "value":"Favorite Flavors"
              }
            ]
          }
        ]
      }
    ],
    "align": [
      "left",
      "center"
    ]
  }]
}

exports['Markdown utils tests createTagsTable - with rows 1'] = {
  "type": "paragraph",
  "children": [{
    "type": "table",
    "children": [
      {
        "type": "tableRow",
        "children": [
          {
            "type": "tableCell",
            "children": [
              {
                "type": "text",
                "value": "Important Information"
              }
            ]
          }
        ]
      },
      {
        "type": "tableRow",
        "children": [
          {
            "type": "tableCell",
            "children": [
              {
                "type": "strong",
                "children": [
                  {
                    "type": "text",
                    "value": "author"
                  }
                ]
              }
            ]
          },
          {
            "type": "tableCell",
            "children": [
              {
                "type": "text",
                "value": "Mike"
              }
            ]
          }
        ]
      },
      {
        "type": "tableRow",
        "children": [
          {
            "type": "tableCell",
            "children": [
              {
                "type": "strong",
                "children": [
                  {
                    "type": "text",
                    "value": "note"
                  }
                ]
              }
            ]
          },
          {
            "type": "tableCell",
            "children": [
              {
                "type": "text",
                "value": "Read this carefully!"
              }
            ]
          }
        ]
      }
    ],
    "align": [
      "left",
      "center"
    ]
  }]
}

exports['Markdown utils tests organizeTags tests 1'] = {
  "top": [
    [
      "author",
      [
        {
          "type": "text",
          "value": "Mike"
        }
      ]
    ]
  ],
  "examples": [],
  "other": [
    [
      "note",
      [
        {
          "type": "text",
          "value": "Read this carefully!"
        }
      ]
    ]
  ]
}

exports['Markdown utils tests parseParagraphContent simple text list 1'] = [
  {
    "type": "paragraph",
    "children": [
      {
        "type": "paragraph",
        "children": [{"type":"text","value":"hello simple"}]
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "type": "paragraph",
        "children": [{"type":"text","value":"content"}]
      }
    ]
  }
]
