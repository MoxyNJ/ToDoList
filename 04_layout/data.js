const dom = {
  type: "document",
  children: [
    {
      type: "element",
      children: [
        {
          type: "text",
          content: "\n        ",
        },
        {
          type: "element",
          children: [
            {
              type: "text",
              content: "\n          ",
            },
            {
              type: "element",
              children: [
                {
                  type: "text",
                  content:
                    "\n            #container {\n              width: 500px;\n              height: 300px;\n              display: flex;\n            }\n        \n            #container #myid {\n              width: 200px;\n            }\n\n            #container .c1 {\n              flex: 1;\n            }\n          ",
                },
              ],
              attributes: [],
              tagName: "style",
              computedStyle: {},
              parent: {
                tageName: "head",
                type: "element",
              },
              style: {},
            },
            {
              type: "text",
              content: "\n        ",
            },
          ],
          attributes: [],
          tagName: "head",
          computedStyle: {},
          parent: {
            tageName: "html",
            type: "element",
          },
          style: {},
        },
        {
          type: "text",
          content: "\n        ",
        },
        {
          type: "element",
          children: [
            {
              type: "text",
              content: "\n          ",
            },
            {
              type: "element",
              children: [
                {
                  type: "text",
                  content: "\n            ",
                },
                {
                  type: "element",
                  children: [],
                  attributes: [
                    {
                      name: "id",
                      value: "myid",
                    },
                  ],
                  tagName: "div",
                  computedStyle: {
                    width: {
                      value: "200px",
                      specificity: [0, 2, 0, 0],
                    },
                  },
                  parent: {
                    tageName: "div",
                    type: "element",
                  },
                  style: {
                    width: 200,
                    left: 0,
                    right: 200,
                    top: 0,
                    bottom: 300,
                    height: 300,
                  },
                },
                {
                  type: "text",
                  content: "\n            ",
                },
                {
                  type: "element",
                  children: [],
                  attributes: [
                    {
                      name: "class",
                      value: "c1",
                    },
                    {
                      name: "isSelfClosing",
                      value: true,
                    },
                  ],
                  tagName: "div",
                  computedStyle: {
                    flex: {
                      value: "1",
                      specificity: [0, 1, 1, 0],
                    },
                  },
                  parent: {
                    tageName: "div",
                    type: "element",
                  },
                  style: {
                    flex: 1,
                    width: 300,
                    left: 200,
                    right: 500,
                    top: 0,
                    bottom: 300,
                    height: 300,
                  },
                },
                {
                  type: "text",
                  content: "\n          ",
                },
              ],
              attributes: [
                {
                  name: "id",
                  value: "container",
                },
              ],
              tagName: "div",
              computedStyle: {
                width: {
                  value: "500px",
                  specificity: [0, 1, 0, 0],
                },
                height: {
                  value: "300px",
                  specificity: [0, 1, 0, 0],
                },
                display: {
                  value: "flex",
                  specificity: [0, 1, 0, 0],
                },
              },
              parent: {
                tageName: "body",
                type: "element",
              },
              style: {
                width: 500,
                height: 300,
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "flex-start",
                flexWrap: "nowrap",
                alignContent: "stretch",
              },
            },
            {
              type: "text",
              content: "\n        ",
            },
          ],
          attributes: [],
          tagName: "body",
          computedStyle: {},
          parent: {
            tageName: "html",
            type: "element",
          },
          style: {},
        },
        {
          type: "text",
          content: "\n        ",
        },
      ],
      attributes: [
        {
          name: "undefined",
        },
      ],
      tagName: "html",
      computedStyle: {},
      parent: {
        type: "document",
      },
      style: {},
    },
    {
      type: "text",
      content: "\r\n",
    },
  ],
};
