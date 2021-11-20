let dom = {
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
              content: "\n            ",
            },
            {
              type: "element",
              children: [
                {
                  type: "text",
                  content: "test",
                },
              ],
              attributes: [],
              tagName: "title",
              computedStyle: {},
              parent: {
                tageName: "head",
                type: "element",
              },
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
                  content:
                    "\n            body #p1{color:#0f0;}\n            div,p{padding:0;margin:0}\n            p{width:30px;text-algin:center;font-size:24px;}\n            div body{padding:20px}\n        ",
                },
              ],
              attributes: [],
              tagName: "style",
              computedStyle: {},
              parent: {
                tageName: "head",
                type: "element",
              },
            },
            {
              type: "text",
              content: "\n    ",
            },
          ],
          attributes: [],
          tagName: "head",
          computedStyle: {},
          parent: {
            tageName: "html",
            type: "element",
          },
        },
        {
          type: "text",
          content: "\n    ",
        },
        {
          type: "element",
          children: [
            {
              type: "text",
              content: "\n        ",
            },
            {
              type: "element",
              children: [],
              attributes: [
                {
                  name: "src",
                  value: "1.jpg",
                },
                {
                  name: "isSelfClosing",
                  value: true,
                },
              ],
              tagName: "img",
              computedStyle: {},
              parent: {
                tageName: "body",
                type: "element",
              },
            },
            {
              type: "text",
              content: "\n        ",
            },
            {
              type: "element",
              children: [],
              attributes: [
                {
                  name: "id",
                  value: "p1",
                },
              ],
              tagName: "p",
              computedStyle: {
                color: {
                  value: "#0f0",
                  specificity: [0, 1, 0, 1],
                },
                padding: {
                  value: "0",
                  specificity: [0, 0, 0, 1],
                },
                margin: {
                  value: "0",
                  specificity: [0, 0, 0, 1],
                },
                width: {
                  value: "30px",
                  specificity: [0, 0, 0, 1],
                },
                "text-algin": {
                  value: "center",
                  specificity: [0, 0, 0, 1],
                },
                "font-size": {
                  value: "24px",
                  specificity: [0, 0, 0, 1],
                },
              },
              parent: {
                tageName: "body",
                type: "element",
              },
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
                  content: "Hello world!",
                },
              ],
              attributes: [],
              tagName: "div",
              computedStyle: {
                padding: {
                  value: "0",
                  specificity: [0, 0, 0, 1],
                },
                margin: {
                  value: "0",
                  specificity: [0, 0, 0, 1],
                },
              },
              parent: {
                tageName: "body",
                type: "element",
              },
            },
            {
              type: "text",
              content: "\n    ",
            },
          ],
          attributes: [],
          tagName: "body",
          computedStyle: {},
          parent: {
            tageName: "html",
            type: "element",
          },
        },
        {
          type: "text",
          content: "   \n    ",
        },
      ],
      attributes: [
        {
          name: "lang",
          value: "en",
        },
      ],
      tagName: "html",
      computedStyle: {},
      parent: {
        type: "document",
      },
    },
    {
      type: "text",
      content: "\r\n",
    },
  ],
};
