import {Box, Button, Card, FormInput, Switch} from 'components';
import {t} from 'i18next';
import styles from './TrainAndTest.module.scss';
import FormDaySelect, {DAYS, DaysSelect} from 'components/FormElements/FormDaySelect/FormDaySelect';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {TrainConfigDataDTO, TrainedDataDTO} from "../../../types/trainSettings";
import {Controller, useForm} from "react-hook-form";
import {AxiosError} from "axios";
import {Methods, request} from '../../../utils/axios-client';
import { stringify } from 'yaml';
import {useToast} from "../../../hooks/useToast";
import {convertFromDaySelect, convertToDaySelect, updateTrainSettings} from "../../../services/train-settings";
import React, {useEffect, useState} from "react";
import {AiOutlineExclamationCircle} from "react-icons/ai";
import useStore from "../../../store/store";

const TrainAndTest = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const {data: settingsData} = useQuery<TrainConfigDataDTO>({
        queryKey: ['training/settings'],
    });
    const {data: trainedData} = useQuery<TrainedDataDTO>({
        queryKey: ['training/trained'],
    });
    const [folds, setFolds] = useState<string>('0');
    const [scheduled, setScheduled] = useState<boolean>(false);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState<string>('17:00:00');
    const [days, setDays] = useState<DaysSelect[]>(DAYS);
    const [llmFailed, setLlmFailed] = useState<boolean>(false);
    const [lastTrainedDay, setLastTrainedDay] = useState<string>(new Date().toISOString().split('T')[0]);
    const [lastTrainedTime, setLastTrainedTime] = useState<string>(new Date().toISOString().split("T")[1].split(".")[0]);
    const userInfo = useStore((state) => state.userInfo);

    const {control, handleSubmit, reset} = useForm<TrainConfigDataDTO>({
        mode: 'onChange',
        shouldUnregister: true,
    });

    useEffect(() => {
        if (settingsData) {
            setFolds(String(settingsData.rasaFolds));
            setDays(convertToDaySelect(settingsData.daysOfWeek || '', days));
            setScheduled(settingsData.scheduled);
            setDate(settingsData.fromDate.split('T')[0]);
            setTime(settingsData.fromDate.split("T")[1].split(".")[0]);
            reset(settingsData);
        }
    }, [days, reset, settingsData]);

    useEffect(() => {
        if(trainedData) {
            setLlmFailed(trainedData.state === 'FAIL');
            setLastTrainedTime(trainedData.trainedDate.split("T")[1].split(".")[0]);
            setLastTrainedDay(formatDate(trainedData.trainedDate.split('T')[0]));
        }
    }, [trainedData]);

    const trainSettingsEditMutation = useMutation({
        mutationFn: (request: TrainConfigDataDTO) => updateTrainSettings(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries(['training/train-settings']);
            toast.open({
                type: 'success',
                title: t('global.notification'),
                message: 'Train settings changes saved',
            });
        },
        onError: (error: AxiosError) => {
            toast.open({
                type: 'error',
                title: t('global.notificationError'),
                message: error.message,
            });
        },
    });

    const handleTrainSettingsSave = handleSubmit((data) => {
        checkForCronJob();
        // data.fromDate = new Date(`${date}T${time}.000Z`).toISOString();
        // data.daysOfWeek = convertFromDaySelect(days);
        // data.modifierId = userInfo?.idCode ?? 'unknown';
        // data.modifierName = `${userInfo?.firstName} ${userInfo?.lastName}`;
        // trainSettingsEditMutation.mutate(data);
    });

    const formatDate = (date: string) => {
        const [year, month, day] = date.split("-");
        return `${day}.${month}.${year}`;
    }

    const checkForCronJob = async () => {
        const steps = new Map();
        steps.set('create_job', {
            trigger: '0 0 1 * * ?',
            type: 'http',
            method: 'GET',
            url: 'http://localhost:8080/train-bot',
        });
        const yaml = stringify(steps);
        // if (data.period === undefined || data.period === 'never') {
        //     await request({
        //         url: deleteCronJobTask(),
        //         method: Methods.post,
        //         data: { location: `/CronManager/${data.datasetId}.yml` },
        //     });
        // } else {
        //     await request({
        //         url: saveJsonToYaml(),
        //         method: Methods.post,
        //         data: { yaml: yaml, location: `/CronManager/${data.datasetId}.yml` },
        //     });
        // }
        await request({
            url: 'http://localhost:8080/saveJsonToYml',
            method: Methods.post,
            data: { yaml: yaml, location: `/CronManager/llm_training.yml` },
        });
    };

    // const getCronExpression = (interval: UpdateIntervalUnitType): string => {
    //     switch (interval) {
    //         case 'day':
    //             return '0 0 * * * ?';
    //         case 'week':
    //             return '0 0 * * 1 ?';
    //         case 'month':
    //             return '0 0 1 * * ?';
    //         case 'quarter':
    //             return '0 0 1 */3 * ?';
    //         case 'year':
    //             return '0 0 1 1 * ?';
    //         default:
    //             return '';
    //     }
    // };

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>{t('training.trainNew.title')}</h1>
                <p className={styles.top__date}>
                    {t('training.trainNew.lastTrained', {
                        date: lastTrainedDay,
                        time: lastTrainedTime,
                    })}
                </p>
                <Button appearance="primary">{t('training.trainNew.trainNow')}</Button>
            </div>
            {llmFailed && trainedData && (<Box
                color="red"
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <AiOutlineExclamationCircle/>
                <p className={styles.warning}>
                    {t('training.trainNew.warning', {
                        date: lastTrainedDay,
                        time: lastTrainedTime,
                    })}
                </p>
            </Box>)}
            <Card
                header={t('training.trainNew.trainingTitle')}
                style={{
                    width: '100%',
                }}
            >
                <div className={styles.card}>
                    <div className={`${styles.trainingInput} ${styles.input}`}>
                        <Controller name='rasaFolds' control={control} render={({ field }) =>
                            <FormInput
                                {...field}
                                value={folds}
                                label={t('training.trainNew.folds')}
                                type="number"
                                onChange={(e) => {
                                    setFolds(e.target.value);
                                    field.onChange(parseInt(e.target.value));
                                }}
                            />
                        } />
                    </div>
                    <div className={`${styles.trainingSwitch} ${styles.input}`}>
                        <Controller name='scheduled' control={control} render={({ field }) =>
                            <Switch
                                {...field}
                                checked={scheduled}
                                onCheckedChange={(e) => {
                                    setScheduled(e)
                                    field.onChange(e)} }
                                onLabel={t('global.yes') ?? ''}
                                offLabel={t('global.no') ?? ''}
                                label={t('training.trainNew.repeatTraining')}
                            />
                        } />
                    </div>
                </div>
            </Card>
            {scheduled && (
                    <Card
                        header={t('training.trainNew.planTitle')}
                        style={{
                            width: '100%',
                        }}
                    >
                        <div className={styles.card}>
                            <div className={`${styles.planDate} ${styles.input}`}>
                                <FormInput
                                    name={"date"}
                                    value={date}
                                    label={t('training.trainNew.date')}
                                    type="date"
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                    }}
                                 />
                            </div>

                            <div className={`${styles.planDays} ${styles.input}`}>
                                <span>{t('training.trainNew.days')}</span>
                                <Controller name='daysOfWeek' control={control} render={({ field }) =>
                                    <FormDaySelect
                                        {...field}
                                        value={days}
                                        onCheckedChange={(days) => {
                                            setDays(days);
                                            field.onChange(days);
                                        }}
                                    />
                                } />
                            </div>
                            <div className={`${styles.planTime} ${styles.input}`}>
                                <FormInput
                                    name={"time"}
                                    value={time}
                                    label={t('training.trainNew.time')}
                                    type="time"
                                    step="1"
                                    onChange={(e) => {
                                        setTime(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
            )}
            <div className={styles.bottom}>
                <Button onClick={handleTrainSettingsSave} appearance="primary">{t('global.save')}</Button>
            </div>
        </div>
    );
};

export default TrainAndTest;
