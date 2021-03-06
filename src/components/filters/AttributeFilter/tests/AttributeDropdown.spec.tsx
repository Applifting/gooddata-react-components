// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount } from 'enzyme';
import * as ReactTestUtils from 'react-addons-test-utils';
import { DropdownButton } from '@gooddata/goodstrap/lib/Dropdown/Dropdown';

import { AttributeDropdown, VISIBLE_ITEMS_COUNT, createAfmFilter } from '../AttributeDropdown';
import { IntlWrapper } from '../../../core/base/IntlWrapper';
import {
    createMetadataMock,
    waitFor,
    ATTRIBUTE_DISPLAY_FORM_URI,
    ATTRIBUTE_DISPLAY_FORM_IDENTIFIER
} from './utils';

describe('AttributeDropdown', () => {
    function renderComponent(props: any = {}) {
        const {
            projectId = 'storybook',
            onApply = (f: Function) => f,
            metadata = createMetadataMock()
        } = props;
        return mount(
            <IntlWrapper locale="en-US">
                <AttributeDropdown {...{ ...props, projectId, onApply, metadata }} />
            </IntlWrapper>
        );
    }

    function createADF() {
        return {
            content: {
                expression: '[/gdc/md/storybook/obj/123]',
                formOf: '/gdc/md/storybook/obj/3'
            },
            links: {
                elements: '/gdc/md/storybook/obj/3/elements'
            },
            meta: {
                category: 'attributeDisplayForm',
                identifier: ATTRIBUTE_DISPLAY_FORM_IDENTIFIER,
                title: 'Country',
                uri: ATTRIBUTE_DISPLAY_FORM_URI
            }
        };
    }

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should render attribute title', () => {
        const attributeDisplayForm = createADF();
        const wrapper = renderComponent({ attributeDisplayForm });
        expect(wrapper.find('.gd-attribute-filter .button-text').text()).toBe(attributeDisplayForm.meta.title);
    });

    it('should render overlay on click and display loading', () => {
        const attributeDisplayForm = createADF();
        const wrapper = renderComponent({ attributeDisplayForm });
        wrapper.find('.gd-attribute-filter .button-dropdown').simulate('click');
        expect(
            document.querySelectorAll('.gd-attribute-filter-overlay .s-attribute-filter-list-loading')
        ).toHaveLength(1);
    });

    it('should render overlay with loaded items', (done) => {
        const attributeDisplayForm = createADF();
        const wrapper = renderComponent({ attributeDisplayForm });
        wrapper.find(DropdownButton).simulate('click');

        const testItems = () => {
            expect(
                document.querySelectorAll('.s-attribute-filter-list-item').length
            ).toBeGreaterThanOrEqual(VISIBLE_ITEMS_COUNT);
            // not every loaded item is visible, it depends on list height and internal fixed-data-table implementation
            done();
        };

        const delayOffset = 250; // Magic constant inside Goodstrap FLEX_DIMENSIONS_THROTTLE :(
        const maxDelay = 1000;
        const increment = 10;
        const intervalTest = () => (document.querySelectorAll('.s-attribute-filter-list-item').length);
        waitFor(intervalTest, maxDelay, delayOffset, increment).then(testItems, testItems);
    });

    it('should run onApply with current selection', (done) => {
        const attributeDisplayForm = createADF();
        const onApply = jest.fn((filter) => {
            expect(filter).toEqual({
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute',
                notIn: ['0']
            });
        });
        const wrapper = renderComponent({
            attributeDisplayForm,
            onApply
        });
        wrapper.find(DropdownButton).simulate('click');

        const testItems = () => {
            // If tests fail here, it is probably because of the FLEX_DIMENSIONS_THROTTLE,
            // that is randomly delaying the display of .s-attribute-filter-list-item
            // try adjusting the maxDelay or other constants
            const itemElement = document.querySelector('.s-attribute-filter-list-item');
            ReactTestUtils.Simulate.click(itemElement);
            const applyElement = document.querySelector('.s-apply');
            ReactTestUtils.Simulate.click(applyElement);
            expect(onApply).toHaveBeenCalledTimes(1);
            done();
        };

        const delayOffset = 250; // Magic constant inside Goodstrap FLEX_DIMENSIONS_THROTTLE :(
        const maxDelay = 2000;
        const increment = 100;
        const intervalTest = () => {
            const test = document.querySelectorAll('.s-attribute-filter-list-item').length;
            return !!test;
        };
        waitFor(intervalTest, maxDelay, delayOffset, increment).then(testItems, testItems);
    });

    describe('createAfmFilter', () => {
        const id = 'foo';
        const selection = [
            {
                uri: '/gdc/md/projectId/obj/1?id=1',
                title: '1'
            },
            {
                uri: '/gdc/md/projectId/obj/1?id=2',
                title: '2'
            }
        ];

        it('should create filter from selection', () => {
            expect(createAfmFilter(id, selection, false)).toEqual({
                id: 'foo',
                in: ['1', '2'],
                type: 'attribute'
            });
        });

        it('should create filter from inverted selection', () => {
            expect(createAfmFilter(id, selection, true)).toEqual({
                id: 'foo',
                notIn: ['1', '2'],
                type: 'attribute'
            });
        });
    });
});
