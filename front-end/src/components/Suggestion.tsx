/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup, Container, Form, Table } from 'react-bootstrap';

import Icon from './Icon';
import axios from '../utils/axiosWrapper';
import { SuggestionDto, SuggestionReqBody } from '../utils/types';

const formatCategory = (category: string) => {
  const words = category.split('_');
  return words
    .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
    .join(' ');
};

interface State {
  adding?: boolean;
  editing?: string;
  suggestions: SuggestionDto[];
}

const Suggestion = (): JSX.Element => {
  const [state, setState] = useState<State>({ suggestions: [] });
  const valueRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get<SuggestionDto[]>('/api/suggestion');

      setState({ suggestions: response.data });
    } catch (err: unknown) {
      setState({ suggestions: [] });
    }
  };

  const addSuggestion = () => {
    setState((prev) => ({ ...prev, adding: !prev.adding, editing: undefined }));
  };

  const edit = (suggestion: SuggestionDto) => {
    setState((prev) => ({ ...prev, editing: suggestion.uuid, adding: false }));
  };

  const cancelEdit = () => {
    setState((prev) => ({ ...prev, editing: undefined, adding: false }));
  };

  const save = async () => {
    if (!valueRef.current?.value || !categoryRef.current?.value) return;
    if (state.editing) {
      const response = await axios.patch<SuggestionReqBody, SuggestionDto>(
        '/api/suggestion/' + state.editing,
        {
          value: valueRef.current.value,
          category: categoryRef.current.value
        }
      );
      setState((prev) => {
        const suggestions = prev.suggestions;
        const edited = suggestions.find((s) => s.uuid === response.data.uuid);
        if (edited) {
          edited.value = response.data.value;
          edited.category = response.data.category;
        }
        return {
          suggestions: [...suggestions],
          adding: false,
          editing: undefined
        };
      });
    } else {
      const response = await axios.post<SuggestionReqBody, SuggestionDto>(
        '/api/suggestion',
        {
          value: valueRef.current.value,
          category: categoryRef.current.value
        }
      );
      setState((prev) => {
        return {
          suggestions: [...prev.suggestions, response.data],
          adding: false,
          editing: undefined
        };
      });
    }
  };

  const deleteSuggestion = async (suggestion: SuggestionDto) => {
    await axios.delete('/api/suggestion/' + suggestion.uuid);

    setState((prev) => {
      const suggestions = prev.suggestions;
      const index = suggestions.findIndex((s) => s.uuid === suggestion.uuid);
      if (index > -1) {
        suggestions.splice(index, 1);
      }
      return {
        suggestions: [...suggestions],
        adding: false,
        editing: undefined
      };
    });
  };

  const textAreaSize = (text?: string) => {
    if (!text) return 1;
    return Math.floor(text.length / 25) + 1;
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const EditRow = ({
    suggestion
  }: {
    suggestion?: SuggestionDto;
  }): JSX.Element => {
    return (
      <tr>
        <td>
          <Form.Control
            size="sm"
            as="textarea"
            rows={textAreaSize(suggestion?.value)}
            ref={valueRef}
            defaultValue={suggestion?.value}
          />
        </td>
        <td>
          <Form.Select
            aria-label="select category"
            ref={categoryRef}
            defaultValue={suggestion?.category}
            size="sm"
          >
            <option value="">...</option>
            <option value="MALE_NAME">Male Name</option>
            <option value="FEMALE_NAME">Female Name</option>
            <option value="STATEMENT">Statement</option>
            <option value="PAST_ACTION">Past Action</option>
            <option value="PRESENT_ACTION">Present Action</option>
          </Form.Select>
        </td>
        <td>
          <ButtonGroup>
            <Button
              size="sm"
              variant="outline-success"
              onClick={(_e) => save()}
            >
              <Icon icon="nf-fa-save"></Icon>
            </Button>
            <Button
              size="sm"
              variant="outline-warning"
              onClick={(_e) => cancelEdit()}
            >
              <Icon icon="nf-fa-ban"></Icon>
            </Button>
          </ButtonGroup>
        </td>
      </tr>
    );
  };

  const SuggestionRow = ({
    suggestion
  }: {
    suggestion: SuggestionDto;
  }): JSX.Element => {
    if (state.editing === suggestion.uuid) {
      return <EditRow suggestion={suggestion} />;
    } else {
      return (
        <tr>
          <td className="text-wrap">{suggestion.value}</td>
          <td className="text-nowrap">{formatCategory(suggestion.category)}</td>
          <td>
            <ButtonGroup>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={(_e) => edit(suggestion)}
              >
                <Icon icon="nf-fa-edit"></Icon>
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={(_e) => deleteSuggestion(suggestion)}
              >
                <Icon icon="nf-fa-trash" />
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      );
    }
  };

  return (
    <Container fluid>
      <h3>Suggestions</h3>
      <Table variant="light" size="sm" hover>
        <thead>
          <tr>
            <th scope="col">Value</th>
            <th scope="col">Category</th>
            <th scope="col" className="d-flex">
              <Button
                size="sm"
                variant="outline-primary"
                className="ms-auto"
                onClick={(_e) => addSuggestion()}
              >
                <Icon icon="nf-fa-plus" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {state.adding && <EditRow />}
          {state.suggestions
            .sort(
              (a, b) =>
                a.category.localeCompare(b.category) * 1000 +
                a.value.localeCompare(b.value)
            )
            .map((item: SuggestionDto, index: number) => (
              <SuggestionRow key={index} suggestion={item} />
            ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Suggestion;
