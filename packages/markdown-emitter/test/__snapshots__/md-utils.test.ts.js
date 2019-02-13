exports['MarkdownUtilsTests create root AST node from source root 1'] = {
  "type": "root",
  "children": [
    {
      "type": "heading",
      "depth": 1,
      "children": [
        {
          "type": "text",
          "value": "foo"
        }
      ]
    },
    {
      "type": "paragraph",
      "children": [
        {
          "type": "inlineCode",
          "value": "src/foo"
        }
      ]
    }
  ]
}

exports['MarkdownUtilsTests createSection tests 1'] = [
  {
    "type": "heading",
    "depth": 1,
    "children": [
      {
        "type": "text",
        "value": "My Title"
      }
    ]
  }
]

exports['MarkdownUtilsTests createTagsTable - no rows 1'] = {
  "type": "table",
  "align": [
    "left",
    "center"
  ],
  "children": [
    {
      "type": "tableRow",
      "children": [
        {
          "type": "tableCell",
          "children": [
            {
              "type": "text",
              "value": "Favorite Flavors"
            }
          ]
        }
      ]
    }
  ]
}

exports['MarkdownUtilsTests createTagsTable - with rows 1'] = {
  "type": "table",
  "align": [
    "left",
    "center"
  ],
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
  ]
}

exports['MarkdownUtilsTests organizeTags tests 1'] = {
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

exports['MarkdownUtilsTests parseDocumentation - code block 1'] = [
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "This is a simple comment"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "\n"
      },
      {
        "type": "code",
        "lang": "ts",
        "value": "function foo() {}"
      },
      {
        "type": "text",
        "value": "\n"
      }
    ]
  }
]

exports['MarkdownUtilsTests parseDocumentation - custom tags 1'] = [
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "hello tags"
      }
    ]
  }
]

exports['MarkdownUtilsTests parseDocumentation - summary nodes 1'] = [
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "hey, show me some examples"
      }
    ]
  }
]

exports['MarkdownUtilsTests parseParagraphContent simple text list 1'] = [
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "hello simple"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "type": "text",
        "value": "content"
      }
    ]
  }
]
