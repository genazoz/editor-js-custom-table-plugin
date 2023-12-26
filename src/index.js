import Table from './plugin';
import './styles/index.pcss';

export default Table

const editor = new EditorJS({
    autofocus: true,
    tools: {
        table: {
            class: Table,
            inlineToolbar: true,
            config: {
                withHeadings: true,
                contents: {
                    inlineInsertions: [
                        'пациенты.кол-во',
                        'счет.сумма',
                        'врачи.кол-во',
                    ],
                    iteratables: {
                        billings: [
                            'услуги',
                            'название',
                            'код',
                            'цена',
                        ],
                        patients: [
                            'фио',
                            'возраст',
                            'пол',
                            'номер',
                        ],
                    }
                },
            }
        }
    },
    data: {
        time: 1625072989362,
        blocks: [
            {
                id: "XXVTfnMlcE",
                type: "table",
                data: {
                    iteratableType: "patients",
                    iteratableRowIndex: 3,
                    withHeadings: true,
                    content: [
                        [
                            "English",
                            "Russian",
                            "Japanese",
                            "dddd"
                        ],
                        [
                            "${счет.сумма}",
                            "${element.пол}",
                            "あまい",
                            ""
                        ],
                        [
                            "${element.пол}",
                            "${element.возраст}",
                            "${element.фио}",
                            "${element.номер}"
                        ],
                        [
                            "${врачи.кол-во}",
                            "${пациенты.кол-во}",
                            "${счет.сумма}",
                            ""
                        ],
                        [
                            "Good morning",
                            "Доброе утро",
                            "おはようございます",
                            ""
                        ]
                    ]
                }
            }
        ],
        version: "2.22.1"
    }
});

const saveButton = document.querySelector('.save-button');
const output = document.querySelector('.output');

saveButton.addEventListener('click', () => {
    editor.save().then(savedData => {
        console.log(savedData);
        output.innerHTML = JSON.stringify(savedData, null, 4);
    });
});